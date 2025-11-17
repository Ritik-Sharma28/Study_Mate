from fastapi import APIRouter, Query
from app.database import posts_collection, users_collection
from bson import ObjectId
from datetime import datetime

router = APIRouter()

# ==========================================
# 1. THE MASSIVE KNOWLEDGE BASE
# ==========================================
# This maps your 6 core domains to hundreds of related concepts.
# This acts as the "Brain" of your recommendation engine.

DOMAIN_KNOWLEDGE_BASE = {
    "web": {
        # Fundamentals
        "html", "html5", "css", "css3", "javascript", "js", "es6", "typescript", "ts",
        # Frontend Frameworks
        "react", "reactjs", "vue", "vuejs", "angular", "svelte", "nextjs", "nuxtjs", "tailwind", "bootstrap", "material ui",
        # Backend
        "node", "nodejs", "express", "django", "flask", "fastapi", "spring boot", "laravel", "php", "ruby on rails",
        # Concepts
        "frontend", "backend", "fullstack", "api", "rest", "graphql", "websockets", "pwa", "npm", "yarn", "webpack"
    },
    
    "game": {
        # Engines
        "unity", "unreal engine", "unreal", "godot", "gamemaker", "cryengine",
        # Languages common in games
        "c#", "c++", "lua", "blueprint",
        # Concepts
        "gamedev", "level design", "shaders", "vfx", "physics", "rendering", "3d modeling", "blender", "maya", 
        "sprite", "animation", "multiplayer", "npc", "navmesh", "raytracing", "opengl", "vulkan", "directx"
    },

    "ai": {
        # Core
        "artificial intelligence", "ml", "machine learning", "dl", "deep learning", "neural networks",
        # Libraries
        "tensorflow", "pytorch", "keras", "scikit-learn", "sklearn", "pandas", "numpy", "opencv", "huggingface",
        # Specific Fields
        "nlp", "computer vision", "reinforcement learning", "gan", "llm", "gpt", "transformer", "bert", "diffusion models",
        # Concepts
        "chatbot", "predictive", "data science", "algorithm", "model training", "dataset", "supervised", "unsupervised"
    },

    "cybersecurity": {
        # Attack/Defense
        "hacking", "ethical hacking", "penetration testing", "pentest", "red team", "blue team", "soc", "ciso",
        # Networking Security
        "firewall", "vpn", "network security", "wireshark", "nmap", "packet tracer", "tcp/ip", "dns",
        # Concepts
        "crypto", "cryptography", "encryption", "malware", "ransomware", "phishing", "social engineering", "exploit",
        "vulnerability", "bug bounty", "owasp", "kali linux", "metasploit", "zero day", "auth", "oauth", "jwt"
    },

    "cloud": {
        # Providers
        "aws", "amazon web services", "azure", "gcp", "google cloud", "digitalocean", "heroku", "vercel", "netlify",
        # Containers & Orchestration
        "docker", "kubernetes", "k8s", "container", "podman",
        # Concepts
        "devops", "ci/cd", "pipeline", "serverless", "lambda", "microservices", "terraform", "ansible", "jenkins",
        "linux", "bash", "shell", "scalability", "load balancing", "cdn", "s3", "ec2"
    },

    "dsa": {
        # Core Data Structures
        "array", "linked list", "stack", "queue", "hash map", "hash table", "tree", "binary tree", "bst", "heap", "graph", "trie",
        # Algorithms
        "sorting", "searching", "recursion", "dynamic programming", "dp", "greedy", "backtracking", "divide and conquer",
        # Platforms & Concepts
        "leetcode", "codeforces", "hackerrank", "competitive programming", "cp", "big o", "time complexity", "space complexity",
        "binary search", "dfs", "bfs", "dijkstra", "prim", "kruskal", "interview prep", "coding interview"
    }
}

# ==========================================
# 2. HELPER FUNCTIONS
# ==========================================

def to_naive(dt):
    if dt is None: return datetime.min
    if dt.tzinfo is not None: return dt.replace(tzinfo=None)
    return dt

def get_expanded_user_keywords(user_domains):
    """
    Converts user's ["web", "ai"] into a massive set of 100+ related keywords.
    """
    expanded_set = set()
    for domain in user_domains:
        d_clean = domain.lower().strip()
        # Add the domain itself
        expanded_set.add(d_clean)
        
        # Add all related knowledge base terms
        if d_clean in DOMAIN_KNOWLEDGE_BASE:
            expanded_set.update(DOMAIN_KNOWLEDGE_BASE[d_clean])
            
    return expanded_set

def calculate_advanced_score(user_keywords, post_tags, user_raw_domains):
    """
    Calculates match score using 3 layers of logic.
    """
    score = 0
    post_tags_clean = [t.lower().strip() for t in post_tags]
    
    # Pre-calculate sets for O(1) lookups
    user_raw_set = {d.lower() for d in user_raw_domains}

    for tag in post_tags_clean:
        
        # --- LAYER 1: THE PERFECT MATCH (The Holy Grail) ---
        # User selects "web", Post is tagged "web".
        if tag in user_raw_set:
            score += 1500
            continue # Skip other checks for this tag

        # --- LAYER 2: THE KNOWLEDGE BASE MATCH (Semantic) ---
        # User selects "web", Post is tagged "react".
        if tag in user_keywords:
            score += 800
            continue

        # --- LAYER 3: THE SUB-SEQUENCE / FUZZY MATCH ---
        # User selects "javascript", Post is tagged "javascript-tutorial"
        # or Post is tagged "js", User keywords contain "nodejs" (weak match)
        
        for keyword in user_keywords:
            # Check if one string is inside the other
            # We ensure length > 2 to avoid matching "c" in "cloud" (false positive)
            if len(keyword) > 2 and len(tag) > 2:
                if keyword in tag or tag in keyword:
                    score += 200
                    break # Don't double count the same tag

    return score

# ==========================================
# 3. THE ENDPOINT
# ==========================================

@router.get("/recommend-posts")
def recommend_posts(user_id: str = Query(...)):
    try:
        user_obj_id = ObjectId(user_id)
    except:
        return {"error": "Invalid user ID"}

    user = users_collection.find_one({"_id": user_obj_id})
    if not user:
        return {"error": "User not found"}

    raw_domains = user.get("domains", []) # e.g., ["web", "ai"]
    
    # 1. Expand the user's mind (Generate hundreds of keywords)
    expanded_keywords = get_expanded_user_keywords(raw_domains)

    # 2. Fetch all posts (Ideally use aggregation for production, keeping Python for logic demo)
    posts = list(posts_collection.find({}))
    now = datetime.utcnow()

    ranked_posts = []

    for post in posts:
        post_tags = post.get("tags", [])
        likes_count = len(post.get("likes", []))
        created = to_naive(post.get("createdAt"))
        
        # --- SCORING ENGINE ---
        
        total_score = 0
        
        # A. Relevance (The Heavy Lifter)
        relevance_score = calculate_advanced_score(expanded_keywords, post_tags, raw_domains)
        total_score += relevance_score

        # B. Popularity (Viral Nudge)
        # We cap popularity impact so a viral cooking video doesn't beat a relevant coding video
        # Max popularity bonus = 500 points
        popularity_points = min(likes_count * 2, 500) 
        total_score += popularity_points

        # C. Freshness (Decay)
        # Lose 10 points per day
        days_old = (now - created).days
        total_score -= (days_old * 10)

        # D. Penalties
        if not post_tags:
            total_score -= 500 # Penalize untagged posts heavily

        ranked_posts.append({
            "post": post,
            "score": total_score,
            "debug": {
                "relevance": relevance_score,
                "popularity": popularity_points,
                "age_penalty": days_old * 10
            }
        })

    # 3. Sort & Limit
    ranked_posts.sort(key=lambda x: x["score"], reverse=True)

    final_output = []
    for item in ranked_posts[:30]: # Top 30
        p = item["post"]
        p["_id"] = str(p["_id"])
        p["author"] = str(p.get("author"))
        p["likes"] = [str(uid) for uid in p.get("likes", [])]
        
        # Debug info helps you see WHY it was recommended
        p["_score_breakdown"] = item["debug"]
        
        final_output.append(p)

    return {"recommended": final_output}