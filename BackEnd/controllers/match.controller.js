import User from '../models/User.model.js';
import Post from '../models/Post.model.js';
import mongoose from 'mongoose';

// ==========================================
// 1. THE MASSIVE KNOWLEDGE BASE (FIXED SYNTAX)
// ==========================================

const DOMAIN_KNOWLEDGE_BASE = {
    "web": [
        "html", "html5", "css", "css3", "javascript", "js", "es6", "typescript", "ts",
        "react", "reactjs", "vue", "vuejs", "angular", "svelte", "nextjs", "nuxtjs", "tailwind", "bootstrap", "material ui",
        "node", "nodejs", "express", "django", "flask", "fastapi", "spring boot", "laravel", "php", "ruby on rails",
        "frontend", "backend", "fullstack", "api", "rest", "graphql", "websockets", "pwa", "npm", "yarn", "webpack"
    ],
    "game": [
        "unity", "unreal engine", "unreal", "godot", "gamemaker", "cryengine",
        "c#", "c++", "lua", "blueprint",
        "gamedev", "level design", "shaders", "vfx", "physics", "rendering", "3d modeling", "blender", "maya", 
        "sprite", "animation", "multiplayer", "npc", "navmesh", "raytracing", "opengl", "vulkan", "directx"
    ],
    "ai": [
        "artificial intelligence", "ml", "machine learning", "dl", "deep learning", "neural networks",
        "tensorflow", "pytorch", "keras", "scikit-learn", "sklearn", "pandas", "numpy", "opencv", "huggingface",
        "nlp", "computer vision", "reinforcement learning", "gan", "llm", "gpt", "transformer", "bert", "diffusion models",
        "chatbot", "predictive", "data science", "algorithm", "model training", "dataset", "supervised", "unsupervised"
    ],
    "cybersecurity": [
        "hacking", "ethical hacking", "penetration testing", "pentest", "red team", "blue team", "soc", "ciso",
        "firewall", "vpn", "network security", "wireshark", "nmap", "packet tracer", "tcp/ip", "dns",
        "crypto", "cryptography", "encryption", "malware", "ransomware", "phishing", "social engineering", "exploit",
        "vulnerability", "bug bounty", "owasp", "kali linux", "metasploit", "zero day", "auth", "oauth", "jwt"
    ],
    "cloud": [
        "aws", "amazon web services", "azure", "gcp", "google cloud", "digitalocean", "heroku", "vercel", "netlify",
        "docker", "kubernetes", "k8s", "container", "podman",
        "devops", "ci/cd", "pipeline", "serverless", "lambda", "microservices", "terraform", "ansible", "jenkins",
        "linux", "bash", "shell", "scalability", "load balancing", "cdn", "s3", "ec2"
    ],
    "dsa": [
        "array", "linked list", "stack", "queue", "hash map", "hash table", "tree", "binary tree", "bst", "heap", "graph", "trie",
        "sorting", "searching", "recursion", "dynamic programming", "dp", "greedy", "backtracking", "divide and conquer",
        "leetcode", "codeforces", "hackerrank", "competitive programming", "cp", "big o", "time complexity", "space complexity",
        "binary search", "dfs", "bfs", "dijkstra", "prim", "kruskal", "interview prep", "coding interview"
    ]
};

// ==========================================
// 2. HELPER FUNCTIONS 
// ==========================================

const getSearchTerms = (domainQueries) => {
    const expandedSearchSet = new Set();
    if (!domainQueries || domainQueries.length === 0) return [];

    for (const userQuery of domainQueries) {
        const queryClean = userQuery.toLowerCase().trim();
        expandedSearchSet.add(queryClean);

        // Case 1: User searched a Broad Domain (e.g., "web")
        if (DOMAIN_KNOWLEDGE_BASE[queryClean]) {
            DOMAIN_KNOWLEDGE_BASE[queryClean].forEach(term => expandedSearchSet.add(term));
        }
            
        // Case 2: User searched a Specific Skill (e.g., "react")
        for (const domain in DOMAIN_KNOWLEDGE_BASE) {
            // Note: DOMAIN_KNOWLEDGE_BASE[domain] is now an Array, use .includes()
            if (DOMAIN_KNOWLEDGE_BASE[domain].includes(queryClean)) {
                expandedSearchSet.add(domain);
            }
        }
    }
    return Array.from(expandedSearchSet);
};

const getExpandedUserKeywords = (userDomains) => {
    const expandedSet = new Set();
    for (const domain of userDomains) {
        const d_clean = domain.toLowerCase().trim();
        expandedSet.add(d_clean);
        if (DOMAIN_KNOWLEDGE_BASE[d_clean]) {
            DOMAIN_KNOWLEDGE_BASE[d_clean].forEach(keyword => expandedSet.add(keyword));
        }
    }
    return expandedSet;
};

const calculateAdvancedScore = (expandedKeywords, postTags, userRawDomains) => {
    let score = 0;
    const postTagsClean = postTags.map(t => t.toLowerCase().trim());
    const userRawSet = new Set(userRawDomains.map(d => d.toLowerCase()));

    for (const tag of postTagsClean) {
        // 1. Raw Domain Match (Highest weight)
        if (userRawSet.has(tag)) {
            score += 1500;
            continue;
        }
        // 2. Expanded Keyword Match (High weight)
        if (expandedKeywords.has(tag)) {
            score += 800;
            continue;
        }
        // 3. Partial/Substring Match (Medium weight)
        for (const keyword of expandedKeywords) {
            if (keyword.length > 2 && tag.length > 2) {
                if (keyword.includes(tag) || tag.includes(keyword)) {
                    score += 200;
                    break; 
                }
            }
        }
    }
    return score;
};


// ==========================================
// 3. RECOMMEND POSTS (/api/v1/posts/recommend-posts)
// ==========================================

export const recommendPosts = async (req, res) => {
    const userId = req.query.user_id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
        const user = await User.findById(userId).lean();
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const rawDomains = user.domains || [];
        const expandedKeywords = getExpandedUserKeywords(rawDomains);

        const posts = await Post.find({}).lean();
        const now = new Date();

        let rankedPosts = [];

        for (const post of posts) {
            const postTags = post.tags || [];
            const likesCount = post.likes ? post.likes.length : 0;
            const created = post.createdAt;
            
            let totalScore = 0;
            const relevanceScore = calculateAdvancedScore(expandedKeywords, postTags, rawDomains);
            totalScore += relevanceScore;

            const popularityPoints = Math.min(likesCount * 2, 500); 
            totalScore += popularityPoints;

            const daysOld = Math.floor((now - created) / (1000 * 60 * 60 * 24));
            totalScore -= (daysOld * 10);

            if (postTags.length === 0) {
                totalScore -= 500; 
            }

            rankedPosts.push({
                post,
                score: totalScore,
                debug: {
                    relevance: relevanceScore,
                    popularity: popularityPoints,
                    age_penalty: daysOld * 10
                }
            });
        }

        rankedPosts.sort((a, b) => b.score - a.score);
        const topPosts = rankedPosts.slice(0, 30);

        // Fetch authors for the top posts
        const postIds = topPosts.map(item => item.post._id);
        const postsWithAuthor = await Post.find({ _id: { $in: postIds } })
            .populate('author', 'name avatarId')
            .lean(); 

        const finalResults = postsWithAuthor.map(p => {
            const scoredItem = topPosts.find(item => item.post._id.equals(p._id));
            
            // Convert ObjectIds to strings for the frontend
            p.likes = p.likes.map(id => id.toString());
            p._score_breakdown = scoredItem ? scoredItem.debug : {};
            
            return p;
        });

        res.json({ recommended: finalResults });

    } catch (error) {
        console.error("Error in recommendPosts:", error);
        res.status(500).json({ message: 'Failed to generate post recommendations.' });
    }
};

// ==========================================
// 4. FIND PARTNER (/api/v1/partners/find-partner)
// ==========================================

export const findPartner = async (req, res) => {
    const { user_id: currentUserId, domain: domainOverride, study_time: timeOverride, team_pref: teamOverride } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(currentUserId)) {
        return res.status(400).json({ message: "Invalid User ID" });
    }
    const currentUserIdObj = new mongoose.Types.ObjectId(currentUserId);

    try {
        const searcher = await User.findById(currentUserId).lean();
        if (!searcher) {
            return res.status(404).json({ message: "Searching user profile not found" });
        }

        const searchTime = timeOverride ? timeOverride.toLowerCase() : searcher.studyTime ? searcher.studyTime.toLowerCase() : null;
        const searchTeam = teamOverride ? teamOverride.toLowerCase() : searcher.teamPref ? searcher.teamPref.toLowerCase() : null;
        const searchDomains = Array.isArray(domainOverride) ? domainOverride : (domainOverride ? [domainOverride] : (searcher.domains || []));


        const targetSkills = getSearchTerms(searchDomains);
        const targetSkillsSet = new Set(targetSkills);

        const rawCandidates = await User.find(
            { _id: { $ne: currentUserIdObj } },
            { password: 0, email: 0 } 
        ).lean();

        let scoredCandidates = [];

        for (const candidate of rawCandidates) {
            let score = 0;
            let debugReasons = [];

            // 1. Score Skills 
            const candidateDomains = new Set((candidate.domains || []).map(d => d.toLowerCase()));
            let numMatches = 0;
            
            targetSkillsSet.forEach(targetSkill => {
                if (candidateDomains.has(targetSkill)) {
                    numMatches++;
                }
            });

            if (numMatches > 0) {
                score += (numMatches * 100); 
                debugReasons.push(`${numMatches} Skill Match(es)`);
            }
            
            // 2. Score Study Time (50 points)
            if (searchTime) {
                const candTime = candidate.studyTime;
                if (candTime && candTime.toLowerCase() === searchTime) {
                    score += 50;
                    debugReasons.push("Time Match");
                } else if (searchTime === "flexible" && candTime) {
                    score += 10;
                }
            }
            
            // 3. Score Team Preference (30 points)
            if (searchTeam) {
                const candTeam = candidate.teamPref;
                if (candTeam && candTeam.toLowerCase() === searchTeam) {
                    score += 30;
                    debugReasons.push(`${searchTeam.charAt(0).toUpperCase() + searchTeam.slice(1)} Match`);
                }
            }

            // 4. Profile Bonus (5 points)
            if (candidate.bio) {
                score += 5; 
                debugReasons.push("Has Bio");
            }

            scoredCandidates.push({
                user: candidate,
                score: score,
                reasons: debugReasons
            });
        }

        // Sort and format output
        scoredCandidates.sort((a, b) => b.score - a.score);
        
        const finalResults = scoredCandidates.slice(0, 50).map(item => {
            const user = item.user;
            user._match_score = item.score;
            user._match_reasons = item.reasons;
            return user;
        });

        res.json({ matches: finalResults });

    } catch (error) {
        console.error("Error in findPartner:", error);
        res.status(500).json({ message: 'Failed to find study partners.' });
    }
};