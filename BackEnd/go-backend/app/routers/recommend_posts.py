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
        "html", "html5", "css", "css3", "javascript", "js", "es6", "typescript", "ts",
        "react", "reactjs", "vue", "vuejs", "angular", "svelte", "nextjs", "nuxtjs", "tailwind", "bootstrap", "material ui",
        "node", "nodejs", "express", "django", "flask", "fastapi", "spring boot", "laravel", "php", "ruby on rails",
        "frontend", "backend", "fullstack", "api", "rest", "graphql", "websockets", "pwa", "npm", "yarn", "webpack"
    },
    
    "game": {
        "unity", "unreal engine", "unreal", "godot", "gamemaker", "cryengine",
        "c#", "c++", "lua", "blueprint",
        "gamedev", "level design", "shaders", "vfx", "physics", "rendering", "3d modeling", "blender", "maya", 
        "sprite", "animation", "multiplayer", "npc", "navmesh", "raytracing", "opengl", "vulkan", "directx"
    },

    "ai": {
        "artificial intelligence", "ml", "machine learning", "dl", "deep learning", "neural networks",
        "tensorflow", "pytorch", "keras", "scikit-learn", "sklearn", "pandas", "numpy", "opencv", "huggingface",
        "nlp", "computer vision", "reinforcement learning", "gan", "llm", "gpt", "transformer", "bert", "diffusion models",
        "chatbot", "predictive", "data science", "algorithm", "model training", "dataset", "supervised", "unsupervised"
    },

    "cybersecurity": {
        "hacking", "ethical hacking", "penetration testing", "pentest", "red team", "blue team", "soc", "ciso",
        "firewall", "vpn", "network security", "wireshark", "nmap", "packet tracer", "tcp/ip", "dns",
        "crypto", "cryptography", "encryption", "malware", "ransomware", "phishing", "social engineering", "exploit",
        "vulnerability", "bug bounty", "owasp", "kali linux", "metasploit", "zero day", "auth", "oauth", "jwt"
    },

    "cloud": {
        "aws", "amazon web services", "azure", "gcp", "google cloud", "digitalocean", "heroku", "vercel", "netlify",
        "docker", "kubernetes", "k8s", "container", "podman",
        "devops", "ci/cd", "pipeline", "serverless", "lambda", "microservices", "terraform", "ansible", "jenkins",
        "linux", "bash", "shell", "scalability", "load balancing", "cdn", "s3", "ec2"
    },

    "dsa": {
        "array", "linked list", "stack", "queue", "hash map", "hash table", "tree", "binary tree", "bst", "heap", "graph", "trie",
        "sorting", "searching", "recursion", "dynamic programming", "dp", "greedy", "backtracking", "divide and conquer",
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
    expanded_set = set()
    for domain in user_domains:
        d_clean = domain.lower().strip()
        expanded_set.add(d_clean)
        if d_clean in DOMAIN_KNOWLEDGE_BASE:
            expanded_set.update(DOMAIN_KNOWLEDGE_BASE[d_clean])
    return expanded_set

def calculate_advanced_score(user_keywords, post_tags, user_raw_domains):
    score = 0
    post_tags_clean = [t.lower().strip() for t in post_tags]
    user_raw_set = {d.lower() for d in user_raw_domains}

    for tag in post_tags_clean:
        if tag in user_raw_set:
            score += 1500
            continue
        if tag in user_keywords:
            score += 800
            continue
        for keyword in user_keywords:
            if len(keyword) > 2 and len(tag) > 2:
                if keyword in tag or tag in keyword:
                    score += 200
                    break 
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

    raw_domains = user.get("domains", [])
    expanded_keywords = get_expanded_user_keywords(raw_domains)

    posts = list(posts_collection.find({}))
    now = datetime.utcnow()

    ranked_posts = []

    for post in posts:
        post_tags = post.get("tags", [])
        likes_count = len(post.get("likes", []))
        created = to_naive(post.get("createdAt"))
        
        total_score = 0
        relevance_score = calculate_advanced_score(expanded_keywords, post_tags, raw_domains)
        total_score += relevance_score

        popularity_points = min(likes_count * 2, 500) 
        total_score += popularity_points

        days_old = (now - created).days
        total_score -= (days_old * 10)

        if not post_tags:
            total_score -= 500 

        ranked_posts.append({
            "post": post,
            "score": total_score,
            "debug": {
                "relevance": relevance_score,
                "popularity": popularity_points,
                "age_penalty": days_old * 10
            }
        })

    # Sort posts
    ranked_posts.sort(key=lambda x: x["score"], reverse=True)
    top_posts = ranked_posts[:30]

    # --- THIS IS THE FIX ---
    # We must fetch the User details for each post (simulating .populate())
    
    # 1. Collect all unique author IDs
    author_ids = {item["post"].get("author") for item in top_posts if item["post"].get("author")}
    
    # 2. Fetch user objects from MongoDB
    users_cursor = users_collection.find(
        {"_id": {"$in": list(author_ids)}},
        {"name": 1, "avatarId": 1} 
    )
    
    # 3. Create a lookup map: str(ID) -> User Object
    user_map = {}
    for u in users_cursor:
        user_map[str(u["_id"])] = {
            "_id": str(u["_id"]),
            "name": u.get("name", "Unknown User"),
            "avatarId": u.get("avatarId", "0")
        }

    final_output = []
    for item in top_posts:
        p = item["post"]
        p["_id"] = str(p["_id"])
        
        # 4. Attach the full author object instead of just the ID string
        author_id_str = str(p.get("author"))
        if author_id_str in user_map:
             p["author"] = user_map[author_id_str]
        else:
             # Fallback
             p["author"] = {
                 "_id": author_id_str, 
                 "name": "Unknown User", 
                 "avatarId": "0"
             }

        p["likes"] = [str(uid) for uid in p.get("likes", [])]
        p["_score_breakdown"] = item["debug"]
        
        final_output.append(p)

    return {"recommended": final_output}