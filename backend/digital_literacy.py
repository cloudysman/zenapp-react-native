from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime
import json
import hashlib
from PIL import Image, ImageDraw, ImageFont
import io
import base64

router = APIRouter(prefix="/api/literacy", tags=["digital_literacy"])

# In-memory storage (use database in production)
user_progress = {}
leaderboard_data = []

class ProgressUpdate(BaseModel):
    user_id: str
    module: str  # fakeNews, cyberbullying, digitalIdentity
    score: int
    completed_items: List[str]
    skills: Dict[str, int]
    timestamp: Optional[datetime] = None

class LeaderboardEntry(BaseModel):
    user_id: str
    username: str
    total_score: int
    modules_completed: int
    badges: List[str]
    rank: int

class CertificateRequest(BaseModel):
    user_id: str
    username: str
    module: str
    score: int

@router.post("/progress")
async def update_progress(progress: ProgressUpdate):
    """Update user progress for a module"""
    try:
        user_id = progress.user_id
        
        if user_id not in user_progress:
            user_progress[user_id] = {
                "fakeNews": {"score": 0, "completed": [], "skills": {}},
                "cyberbullying": {"score": 0, "completed": [], "skills": {}},
                "digitalIdentity": {"score": 0, "completed": [], "skills": {}},
                "total_score": 0,
                "badges": [],
                "last_updated": datetime.now()
            }
        
        # Update module progress
        user_progress[user_id][progress.module] = {
            "score": progress.score,
            "completed": progress.completed_items,
            "skills": progress.skills
        }
        
        # Calculate total score
        total = sum([
            user_progress[user_id]["fakeNews"]["score"],
            user_progress[user_id]["cyberbullying"]["score"],
            user_progress[user_id]["digitalIdentity"]["score"]
        ])
        user_progress[user_id]["total_score"] = total
        
        # Award badges
        badges = calculate_badges(user_progress[user_id])
        user_progress[user_id]["badges"] = badges
        
        # Update leaderboard
        update_leaderboard(user_id, total, badges)
        
        return {
            "status": "success",
            "total_score": total,
            "badges": badges,
            "rank": get_user_rank(user_id)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/progress/{user_id}")
async def get_progress(user_id: str):
    """Get user progress across all modules"""
    if user_id not in user_progress:
        return {
            "user_id": user_id,
            "modules": {},
            "total_score": 0,
            "badges": [],
            "rank": None
        }
    
    data = user_progress[user_id]
    return {
        "user_id": user_id,
        "modules": {
            "fakeNews": data["fakeNews"],
            "cyberbullying": data["cyberbullying"],
            "digitalIdentity": data["digitalIdentity"]
        },
        "total_score": data["total_score"],
        "badges": data["badges"],
        "rank": get_user_rank(user_id)
    }

@router.get("/leaderboard")
async def get_leaderboard(limit: int = 10):
    """Get top users on leaderboard"""
    sorted_users = sorted(
        [(uid, data["total_score"], data["badges"]) for uid, data in user_progress.items()],
        key=lambda x: x[1],
        reverse=True
    )[:limit]
    
    leaderboard = []
    for rank, (user_id, score, badges) in enumerate(sorted_users, 1):
        leaderboard.append({
            "rank": rank,
            "user_id": user_id,
            "username": f"User_{user_id[:6]}",  # Anonymized
            "total_score": score,
            "badges": badges,
            "modules_completed": count_completed_modules(user_id)
        })
    
    return {"leaderboard": leaderboard}

@router.post("/certificate")
async def generate_certificate(request: CertificateRequest):
    """Generate completion certificate"""
    try:
        # Create certificate image (simplified version)
        img = Image.new('RGB', (800, 600), color='white')
        draw = ImageDraw.Draw(img)
        
        # Add gradient background (simplified)
        for i in range(600):
            color = (255 - i//3, 230 - i//4, 230 - i//4)
            draw.rectangle([0, i, 800, i+1], fill=color)
        
        # Add text (use default font, in production use custom font)
        draw.text((400, 100), "CHỨNG NHẬN", fill='#E53E3E', anchor="mm")
        draw.text((400, 200), f"{request.username}", fill='#1F2937', anchor="mm")
        draw.text((400, 280), "Đã hoàn thành xuất sắc", fill='#4B5563', anchor="mm")
        
        module_names = {
            "fakeNews": "Thám Tử Tin Giả",
            "cyberbullying": "Chiến Binh Chống Bắt Nạt",
            "digitalIdentity": "Kiến Tạo Bản Sắc Số"
        }
        
        draw.text((400, 350), module_names.get(request.module, "Module"), 
                 fill='#E53E3E', anchor="mm")
        draw.text((400, 420), f"Điểm: {request.score}", fill='#4B5563', anchor="mm")
        draw.text((400, 500), f"Ngày: {datetime.now().strftime('%d/%m/%Y')}", 
                 fill='#6B7280', anchor="mm")
        
        # Convert to base64
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        # Save certificate record
        cert_id = hashlib.md5(f"{request.user_id}{request.module}{datetime.now()}".encode()).hexdigest()[:8]
        
        return {
            "certificate_id": cert_id,
            "image_base64": img_base64,
            "issued_date": datetime.now().isoformat(),
            "verify_url": f"/api/literacy/verify/{cert_id}"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats")
async def get_statistics():
    """Get overall platform statistics"""
    total_users = len(user_progress)
    total_badges = sum([len(data["badges"]) for data in user_progress.values()])
    avg_score = sum([data["total_score"] for data in user_progress.values()]) / max(total_users, 1)
    
    module_stats = {
        "fakeNews": 0,
        "cyberbullying": 0,
        "digitalIdentity": 0
    }
    
    for user_data in user_progress.values():
        for module in module_stats:
            if user_data[module]["score"] > 0:
                module_stats[module] += 1
    
    return {
        "total_users": total_users,
        "total_badges_earned": total_badges,
        "average_score": round(avg_score, 1),
        "module_participation": module_stats,
        "top_performer": get_top_performer()
    }

# Helper functions
def calculate_badges(user_data):
    badges = []
    
    # Module completion badges
    if user_data["fakeNews"]["score"] >= 50:
        badges.append("fake_news_detector")
    if user_data["cyberbullying"]["score"] >= 50:
        badges.append("cyber_defender")
    if user_data["digitalIdentity"]["score"] >= 50:
        badges.append("identity_master")
    
    # Special badges
    if user_data["total_score"] >= 200:
        badges.append("digital_expert")
    if all([user_data[m]["score"] > 0 for m in ["fakeNews", "cyberbullying", "digitalIdentity"]]):
        badges.append("well_rounded")
    
    return badges

def update_leaderboard(user_id, score, badges):
    global leaderboard_data
    leaderboard_data = sorted(
        [(uid, user_progress[uid]["total_score"]) for uid in user_progress],
        key=lambda x: x[1],
        reverse=True
    )

def get_user_rank(user_id):
    for rank, (uid, _) in enumerate(leaderboard_data, 1):
        if uid == user_id:
            return rank
    return None

def count_completed_modules(user_id):
    if user_id not in user_progress:
        return 0
    count = 0
    for module in ["fakeNews", "cyberbullying", "digitalIdentity"]:
        if user_progress[user_id][module]["score"] > 0:
            count += 1
    return count

def get_top_performer():
    if not user_progress:
        return None
    top_user = max(user_progress.items(), key=lambda x: x[1]["total_score"])
    return {
        "user_id": top_user[0],
        "score": top_user[1]["total_score"],
        "badges": top_user[1]["badges"]
    }