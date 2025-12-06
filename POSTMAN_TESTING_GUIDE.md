# Postman Testing Guide for New Features

## 📋 Prerequisites

### 1. Environment Setup

Add this line to your `.env` file to disable authentication for testing:

```env
DISABLE_AUTH=true
```

**⚠️ IMPORTANT:** Only use `DISABLE_AUTH=true` for testing. Never enable this in production!

### 2. Start Your Server

```bash
npm run dev
```

Your server should be running on `http://localhost:5001` (or your configured PORT).

### 3. Base URL

All endpoints use this base URL:
```
http://localhost:5001/api
```

---

## 🔐 Authentication Note

When `DISABLE_AUTH=true`:
- ✅ No Bearer token required
- ✅ All endpoints are accessible without authentication
- ✅ A test user is automatically created/used
- ⚠️ Warning message appears in server console

---

## 📝 Feature 1: General Chat Bot (ChatGPT-like)

### Endpoint
```
POST /api/chat/general
```

### Headers
```
Content-Type: application/json
```
(No Authorization header needed when `DISABLE_AUTH=true`)

### Request Body Examples

#### Example 1: First Message (No History)
```json
{
  "message": "What is machine learning?",
  "history": []
}
```

#### Example 2: Follow-up Message (With History)
```json
{
  "message": "Can you explain neural networks?",
  "history": [
    {
      "role": "user",
      "parts": [{ "text": "What is machine learning?" }]
    },
    {
      "role": "model",
      "parts": [{ "text": "Machine learning is a subset of artificial intelligence..." }]
    }
  ]
}
```

### Expected Response (200 OK)
```json
{
  "response": "Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed...",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Postman Steps:
1. **Method:** POST
2. **URL:** `http://localhost:5001/api/chat/general`
3. **Headers Tab:**
   - Key: `Content-Type`, Value: `application/json`
4. **Body Tab:**
   - Select: `raw`
   - Select: `JSON` from dropdown
   - Paste the JSON request body above
5. **Click Send**

---

## 📚 Feature 2: Learning Path Generation

### Endpoint 1: Generate Learning Path
```
POST /api/learning-path/generate
```

### Headers
```
Content-Type: application/json
```

### Request Body Examples

#### Example 1: Basic Learning Path
```json
{
  "goals": "I want to learn web development with React and Node.js",
  "preferences": "Focus on modern best practices and hands-on projects"
}
```

#### Example 2: Academic Learning Path
```json
{
  "goals": "I need to understand machine learning fundamentals for my research",
  "preferences": "Include mathematical foundations and practical implementations"
}
```

### Expected Response (201 Created)
```json
{
  "path": {
    "overview": "This learning path will guide you through web development...",
    "steps": [
      {
        "order": 1,
        "title": "HTML & CSS Fundamentals",
        "description": "Learn the basics of HTML structure and CSS styling",
        "estimatedTime": "1-2 weeks",
        "resources": ["MDN Web Docs", "CSS-Tricks"]
      },
      {
        "order": 2,
        "title": "JavaScript Basics",
        "description": "Master JavaScript fundamentals",
        "estimatedTime": "2-3 weeks",
        "resources": ["JavaScript.info", "FreeCodeCamp"]
      }
    ],
    "estimatedTotalTime": "3-4 months",
    "difficulty": "Intermediate",
    "prerequisites": []
  },
  "cached": false,
  "id": "65a1b2c3d4e5f6a7b8c9d0e1",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### Postman Steps:
1. **Method:** POST
2. **URL:** `http://localhost:5001/api/learning-path/generate`
3. **Headers Tab:**
   - Key: `Content-Type`, Value: `application/json`
4. **Body Tab:**
   - Select: `raw`
   - Select: `JSON`
   - Paste the JSON request body
5. **Click Send**

---

### Endpoint 2: Get Learning Path
```
GET /api/learning-path
```

### Headers
(No special headers needed)

### Expected Response (200 OK)
```json
{
  "path": {
    "overview": "...",
    "steps": [...],
    "estimatedTotalTime": "3-4 months",
    "difficulty": "Intermediate",
    "prerequisites": []
  },
  "id": "65a1b2c3d4e5f6a7b8c9d0e1",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Postman Steps:
1. **Method:** GET
2. **URL:** `http://localhost:5001/api/learning-path`
3. **Click Send**

---

## 🎓 Feature 3: Explain Hard Concepts from Documents

### Prerequisites
Before testing this endpoint, you need to have a material (document) uploaded.

#### Step 1: Create a Material First

**Endpoint:** `POST /api/materials`

**Request Body:**
```json
{
  "fileName": "machine-learning-basics.pdf",
  "storagePath": "test-user-id/machine-learning-basics.pdf",
  "fileType": "pdf"
}
```

**Note:** In a real scenario, the file would be uploaded to Supabase Storage first, then you'd register it here. For testing, you can create a material record.

**Expected Response:**
```json
{
  "_id": "65a1b2c3d4e5f6a7b8c9d0e2",
  "fileName": "machine-learning-basics.pdf",
  "storagePath": "test-user-id/machine-learning-basics.pdf",
  "fileType": "pdf",
  "user": "65a1b2c3d4e5f6a7b8c9d0e1",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Save the `_id` from this response - you'll need it for the next step!**

---

### Step 2: Explain Concepts from Material

**Endpoint:**
```
POST /api/materials/:id/explain-concepts
```

Replace `:id` with the material ID from Step 1.

**Headers:**
```
Content-Type: application/json
```

**Request Body Examples:**

#### Example 1: English (Default)
```json
{
  "language": "English"
}
```

#### Example 2: Spanish
```json
{
  "language": "Spanish"
}
```

#### Example 3: French
```json
{
  "language": "French"
}
```

#### Example 4: Minimal (Uses Default English)
```json
{}
```

### Expected Response (201 Created or 200 OK if cached)
```json
{
  "concepts": [
    {
      "concept": "Neural Networks",
      "explanation": "A neural network is a computing system inspired by biological neural networks...",
      "difficulty": 4,
      "examples": [
        "Think of it like the human brain with interconnected neurons",
        "Similar to how neurons fire signals to each other"
      ],
      "prerequisites": ["Linear Algebra", "Calculus"]
    },
    {
      "concept": "Backpropagation",
      "explanation": "Backpropagation is an algorithm for training neural networks...",
      "difficulty": 5,
      "examples": [
        "Like learning from mistakes and adjusting",
        "Similar to how you refine your technique after practice"
      ],
      "prerequisites": ["Neural Networks", "Gradient Descent"]
    }
  ],
  "language": "English",
  "cached": false,
  "id": "65a1b2c3d4e5f6a7b8c9d0e3"
}
```

### Postman Steps:
1. **Method:** POST
2. **URL:** `http://localhost:5001/api/materials/YOUR_MATERIAL_ID_HERE/explain-concepts`
   - Replace `YOUR_MATERIAL_ID_HERE` with the actual material ID
3. **Headers Tab:**
   - Key: `Content-Type`, Value: `application/json`
4. **Body Tab:**
   - Select: `raw`
   - Select: `JSON`
   - Paste the JSON request body
5. **Click Send**

---

## 🧪 Complete Testing Flow Example

Here's a recommended order for testing all features:

### 1. Health Check (Verify Server is Running)
```
GET http://localhost:5001/api/health
```

### 2. Test General Chat
```
POST http://localhost:5001/api/chat/general
Body: { "message": "Hello, what can you help me with?", "history": [] }
```

### 3. Create a Test Material
```
POST http://localhost:5001/api/materials
Body: {
  "fileName": "test-document.pdf",
  "storagePath": "test/test-document.pdf",
  "fileType": "pdf"
}
```
**Copy the `_id` from response**

### 4. Test Concept Explanation
```
POST http://localhost:5001/api/materials/{MATERIAL_ID}/explain-concepts
Body: { "language": "English" }
```

### 5. Test Learning Path Generation
```
POST http://localhost:5001/api/learning-path/generate
Body: {
  "goals": "I want to learn Python programming",
  "preferences": "Focus on data science applications"
}
```

### 6. Get Learning Path
```
GET http://localhost:5001/api/learning-path
```

---

## 🐛 Troubleshooting

### Error: "Material not found"
- Make sure you created a material first and are using the correct ID
- Check that the material belongs to the test user (when `DISABLE_AUTH=true`, a test user is used)

### Error: "File parsing failed"
- This happens when the file doesn't exist in Supabase Storage
- For testing, you might need to upload a real file to Supabase first
- Or mock the file parsing service for local testing

### Error: "AI service failed"
- Check that `GEMINI_API_KEY` is set in your `.env` file
- Verify your API key is valid and has quota remaining

### Error: 500 Server Error
- Check server console for detailed error messages
- Verify all environment variables are set correctly
- Ensure MongoDB connection is working

---

## 📦 Postman Collection JSON

You can import this into Postman:

```json
{
  "info": {
    "name": "AI Learning Backend - New Features",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5001/api"
    },
    {
      "key": "materialId",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/health"
      }
    },
    {
      "name": "General Chat",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"message\": \"What is machine learning?\",\n  \"history\": []\n}"
        },
        "url": "{{baseUrl}}/chat/general"
      }
    },
    {
      "name": "Create Material",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"fileName\": \"test-document.pdf\",\n  \"storagePath\": \"test/test-document.pdf\",\n  \"fileType\": \"pdf\"\n}"
        },
        "url": "{{baseUrl}}/materials"
      },
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "if (pm.response.code === 201) {",
              "  const jsonData = pm.response.json();",
              "  pm.collectionVariables.set('materialId', jsonData._id);",
              "}"
            ]
          }
        }
      ]
    },
    {
      "name": "Explain Concepts",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"language\": \"English\"\n}"
        },
        "url": "{{baseUrl}}/materials/{{materialId}}/explain-concepts"
      }
    },
    {
      "name": "Generate Learning Path",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"goals\": \"I want to learn web development\",\n  \"preferences\": \"Focus on React\"\n}"
        },
        "url": "{{baseUrl}}/learning-path/generate"
      }
    },
    {
      "name": "Get Learning Path",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/learning-path"
      }
    }
  ]
}
```

Save this as a `.json` file and import it into Postman!

---

## ✅ Success Checklist

- [ ] Server starts without errors
- [ ] Health check returns 200 OK
- [ ] General chat responds with AI-generated answer
- [ ] Learning path generates successfully
- [ ] Learning path can be retrieved
- [ ] Material can be created
- [ ] Concept explanations are generated (if file exists in storage)

---

## 🔒 Security Reminder

**Remember to set `DISABLE_AUTH=false` or remove it from `.env` before deploying to production!**

---

Happy Testing! 🚀

