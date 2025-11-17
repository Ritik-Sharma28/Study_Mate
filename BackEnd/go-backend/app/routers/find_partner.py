from fastapi import APIRouter, Query, HTTPException
from app.database import users_collection  # Assuming you import this from your app
from bson import ObjectId
from enum import Enum
from typing import List, Optional

router = APIRouter()

# --- 1. Define Searchable Options ---

class StudyTimeType(str, Enum):
    MORNING = "morning"
    AFTERNOON = "afternoon"
    EVENING = "evening"
    NIGHT = "night"
    FLEXIBLE = "flexible"

class TeamPrefType(str, Enum):
    SOLO = "solo"
    TEAM = "team"

# The "Brain" of your matching logic.
# Maps broad domains to specific, searchable skills.
DOMAIN_KNOWLEDGE_BASE = {
    "web": {"html", "css", "javascript", "react", "angular", "vue", "node", "django", "flask", "sql", "frontend", "backend"},
    "game": {"unity", "unreal", "c#", "c++", "gamedev", "blender", "godot"},
    "ai": {"python", "pytorch", "tensorflow", "ml", "machine learning", "deep learning", "nlp", "pandas", "data science"},
    "cybersecurity": {"hacking", "network", "linux", "crypto", "security", "pentest", "owasp", "nmap"},
    "app": {"mobile", "ios", "android", "flutter", "react native", "swift", "kotlin"}
}

# --- 2. Smart Search Logic ---

def get_search_terms(domain_queries: List[str]) -> List[str]:
    """
    Expands a list of queries (like ["React", "AI"]) into a full set of related terms.
    
    - If user searches ["Web"] -> returns ["web", "react", "node", ...]
    - If user searches ["React"] -> returns ["react", "web"]
    - If user searches ["React", "Python"] -> returns ["react", "web", "python", "ai", ...]
    """
    expanded_search_set = set()
    if not domain_queries:
        return []

    for user_query in domain_queries:
        query_clean = user_query.lower().strip()
        search_terms = {query_clean}
        
        # Case 1: User searched a Broad Domain (e.g., "web")
        if query_clean in DOMAIN_KNOWLEDGE_BASE:
            search_terms.update(DOMAIN_KNOWLEDGE_BASE[query_clean])
            
        # Case 2: User searched a Specific Skill (e.g., "react")
        for domain, skills in DOMAIN_KNOWLEDGE_BASE.items():
            if query_clean in skills:
                search_terms.add(domain)
        
        expanded_search_set.update(search_terms)
            
    return list(expanded_search_set) # Convert to list for MongoDB query

# --- 3. The API Endpoint ---

@router.get("/find-partner")
def find_partner(
    user_id: str = Query(..., description="The ID of the user who is searching (to exclude them from results)"),
    domains: Optional[List[str]] = Query(None, alias="domain", description="[Optional] Override your profile's skills"),
    study_time: Optional[StudyTimeType] = Query(None, description="[Optional] Override your profile's study time"),
    team_pref: Optional[TeamPrefType] = Query(None, description="[Optional] Override your profile's team preference")
):
    """
    Finds and ranks compatible study partners.
    It automatically uses YOUR (the user's) profile settings
    unless you provide optional overrides.
    """
    
    # --- A. Validation & Fetch Searching User ---
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid User ID")
    current_user_oid = ObjectId(user_id)

    searcher = users_collection.find_one({"_id": current_user_oid})
    if not searcher:
        raise HTTPException(status_code=404, detail="Searching user profile not found")

    # --- B. Determine Final Search Criteria (THE FIX IS HERE) ---
    
    # Use override if provided, otherwise use the searcher's profile
    search_time = study_time.value if study_time else searcher.get("studyTime")
    search_team = team_pref.value if team_pref else searcher.get("teamPref")
    
    # Use override domains if provided, otherwise use the searcher's own domains
    search_domains = domains if domains else searcher.get("domains", [])

    # We NO LONGER raise an error if domains are missing.
    # We'll just search with an empty set.

    # --- C. Broaden Skill Search ---
    target_skills = get_search_terms(search_domains) # Use the new 'search_domains'
    target_skills_set = set(target_skills)

    # --- D. Database Query (LOGIC CHANGED) ---
    # We now fetch EVERYONE except the user. We removed the "domains" filter.
    # This is the "Soft Filter" you wanted.
    raw_candidates = list(users_collection.find(
        {
            "_id": {"$ne": current_user_oid}
        },
        {"password": 0, "email": 0} # --- IMPORTANT: Exclude sensitive data
    ))

    # --- E. Compatibility Scoring (LOGIC UPDATED) ---
    scored_candidates = []
    for candidate in raw_candidates:
        score = 0
        debug_reasons = []

        # 1. Score Skills (Most Important)
        #    NEW LOGIC: Give 100 points PER skill match. This is much stronger.
        candidate_domains = {d.lower() for d in candidate.get("domains", [])}
        skill_matches = target_skills_set.intersection(candidate_domains)
        num_matches = len(skill_matches)
        
        if num_matches > 0:
            score += (num_matches * 100) # e.g., 3 skill matches = 300 points
            debug_reasons.append(f"{num_matches} Skill Match(es)")
        # --- We REMOVED the 'else: continue' ---
        
        # 2. Score Study Time (Important)
        if search_time:
            cand_time = candidate.get("studyTime")
            if cand_time and cand_time.lower() == search_time.lower():
                score += 50
                debug_reasons.append("Time Match")
            elif cand_time and search_time == "flexible":
                score += 10 # Small bonus if the searcher is flexible
        # 3. Score Team Preference (Nice to have)
        if search_team:
            cand_team = candidate.get("teamPref")
            if cand_team and cand_team.lower() == search_team.lower():
                score += 30
                debug_reasons.append(f"{search_team.capitalize()} Match")

        # 4. Profile Bonus
        if candidate.get("bio"):
            score += 5 # Small bonus for having a bio

        # --- We REMOVED the 'if score >= 100' check ---
        # We add EVERYONE, even if their score is 0.
        scored_candidates.append({
            "user": candidate,
            "score": score,
            "reasons": debug_reasons
        })

    # --- F. Sort & Format Output ---
    scored_candidates.sort(key=lambda x: x["score"], reverse=True)

    final_results = []
    for item in scored_candidates[:50]: # Return top 50 matches
        user_data = item["user"]
        
        # Convert BSON types to string for JSON
        user_data["_id"] = str(user_data["_id"])
        
        # Add the debug info for the frontend UI
        user_data["_match_score"] = item["score"]
        user_data["_match_reasons"] = item["reasons"]
        
        final_results.append(user_data)

    return {"matches": final_results}