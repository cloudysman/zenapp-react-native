from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import google.generativeai as genai
import uvicorn

# Cấu hình Gemini API
GEMINI_API_KEY = "AIzaSyDBPxeJNTjC370xEbLFaLhSpkmnp7GLy3o"
genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI(title="Digital Wellness Chatbot API")

# Cấu hình CORS cho React Native
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class ChatMessage(BaseModel):
    message: str
    conversation_history: List[dict] = []
    context: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    status: str

# Prompt hệ thống cho chatbot
SYSTEM_PROMPT = """
Bạn là một trợ lý AI thân thiện tên là "Zen" - chuyên hỗ trợ người dùng quản lý thời gian sử dụng điện thoại và phát triển kỹ năng sống số lành mạnh.

TÍNH CÁCH CỦA BẠN:
- Thân thiện, gần gũi và khuyến khích
- Sử dụng tiếng Việt tự nhiên, không quá trang trọng
- Luôn tích cực và đưa ra lời khuyên thực tế
- Đôi khi sử dụng emoji để tạo sự gần gũi (nhưng không quá nhiều)

CHUYÊN MÔN CỦA BẠN:
- Quản lý thời gian sử dụng smartphone
- Kỹ năng sống số (digital wellness)
- Giúp giảm addiction smartphone
- Cải thiện sự tập trung và năng suất
- Thói quen lành mạnh với công nghệ
- Kỹ thuật Pomodoro, Deep Work, Mindfulness
- Giảm FOMO và stress từ mạng xã hội
- Cải thiện giấc ngủ và sức khỏe thể chất

CÁCH TRUYỀN ĐẠT:
- Câu trả lời ngắn gọn, dễ hiểu (2-4 câu chính)
- Đưa ra mẹo thực tế có thể áp dụng ngay
- Đồng cảm với khó khăn của người dùng
- Khuyến khích và động viên tích cực
- Nếu có context về mẹo liên quan, hãy lồng ghép tự nhiên vào câu trả lời

QUY TẮC:
- Nếu câu hỏi không liên quan đến digital wellness, hãy nhẹ nhàng hướng về chủ đề chính
- Luôn kết thúc bằng một gợi ý hoặc câu hỏi để tiếp tục cuộc trò chuyện
- Không đưa ra lời khuyên y tế chuyên sâu, chỉ gợi ý thói quen lành mạnh
- Khi nhận được context về mẹo cụ thể, hãy tích hợp nó một cách tự nhiên

KỸ NĂNG SỐNG SỐ BẠN CÓ THỂ CHIA SẺ:
1. Kỹ thuật tập trung: Pomodoro, Deep Work, Time Boxing
2. Quản lý thông báo: Tắt thông báo không cần thiết, Focus Mode
3. Chăm sóc giấc ngủ: Quy tắc 30-30, Night Shift, Wind Down Mode
4. Giảm FOMO: Unfollow tiêu cực, Social Media Detox, Scheduled Check
5. Chánh niệm: Thở 4-7-8, Digital Mindfulness, Tech-Free Meals
6. Sức khỏe thể chất: Quy tắc 20-20-20, Phone Neck Prevention, Eye Palming
7. Tổ chức và hiệu suất: App Limits, Batching Tasks, Digital Declutter

Hãy trả lời một cách tự nhiên và hữu ích!
"""

@app.get("/")
async def root():
    return {"message": "Digital Wellness Chatbot API is running!"}

@app.post("/chat", response_model=ChatResponse)
async def chat_with_bot(chat_request: ChatMessage):
    try:
        # Tạo model Gemini
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Xây dựng conversation history
        conversation = []
        
        # Thêm system prompt
        conversation.append({
            "role": "user",
            "parts": [SYSTEM_PROMPT]
        })
        conversation.append({
            "role": "model", 
            "parts": ["Chào bạn! Mình là Zen, trợ lý giúp bạn cân bằng cuộc sống số. Mình sẵn sàng hỗ trợ bạn! 😊"]
        })
        
        # Thêm lịch sử hội thoại
        for msg in chat_request.conversation_history:
            conversation.append({
                "role": msg["role"],
                "parts": [msg["content"]]
            })
        
        # Thêm context nếu có (mẹo liên quan)
        current_message = chat_request.message
        if chat_request.context:
            current_message = f"{chat_request.message}\n\n{chat_request.context}"
        
        # Thêm tin nhắn hiện tại
        conversation.append({
            "role": "user",
            "parts": [current_message]
        })
        
        # Tạo chat session
        chat = model.start_chat(history=conversation[:-1])
        
        # Gửi tin nhắn và nhận phản hồi
        response = chat.send_message(current_message)
        
        return ChatResponse(
            response=response.text,
            status="success"
        )
        
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Đã có lỗi xảy ra khi xử lý tin nhắn: {str(e)}"
        )

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Digital Wellness Chatbot"}

@app.get("/daily-tip")
async def get_daily_tip():
    """Endpoint để lấy mẹo hàng ngày"""
    import random
    import datetime
    
    tips = [
        {
            "title": "Kỹ thuật Pomodoro",
            "content": "Làm việc 25 phút, nghỉ 5 phút. Giúp duy trì tập trung cao độ!",
            "category": "Tập trung"
        },
        {
            "title": "Quy tắc 20-20-20",
            "content": "Sau 20 phút nhìn màn hình, nhìn xa 20 feet trong 20 giây.",
            "category": "Sức khỏe"
        },
        {
            "title": "Digital Detox",
            "content": "Thử 1 ngày cuối tuần không dùng mạng xã hội. Tốt cho tâm trí!",
            "category": "Mạng xã hội"
        },
    ]
    
    # Use date as seed for consistent daily tip
    today = datetime.date.today()
    random.seed(today.toordinal())
    daily_tip = random.choice(tips)
    
    return {"tip": daily_tip, "date": str(today)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)