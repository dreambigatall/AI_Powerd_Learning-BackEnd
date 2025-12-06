# 🧪 Quick Test Guide - New Endpoints Only

## ⚙️ Setup

Make sure your `.env` has:
```env
DISABLE_AUTH=true
GEMINI_API_KEY=your_key_here
MONGO_URI=your_mongo_uri
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
```

Start server: `npm run dev`

Base URL: `http://localhost:5001/api`

---

## 🆕 Feature 1: General Chat Bot

### Endpoint
```
POST /api/chat/general
```

### Mock Request Body
```json
{
  "message": "What is artificial intelligence?",
  "history": []
}
```

### Second Request (With History)
```json
{
  "message": "Can you explain neural networks?",
  "history": [
    {
      "role": "user",
      "parts": [{ "text": "What is artificial intelligence?" }]
    },
    {
      "role": "model",
      "parts": [{ "text": "Artificial intelligence (AI) is a branch of computer science..." }]
    }
  ]
}
```

### Expected Response
```json
{
  "response": "Artificial intelligence (AI) is a branch of computer science...",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 🆕 Feature 2: Learning Path Generation

### ⚠️ IMPORTANT: The endpoint is `/api/learning-path` (with hyphen), NOT `/api/learning`

### Generate Learning Path
**Endpoint:** `POST /api/learning-path/generate`

#### Mock Request Body 1
```json
{
  "goals": "I want to master full-stack web development",
  "preferences": "Focus on modern frameworks like React and Node.js, include hands-on projects"
}
```

#### Mock Request Body 2
```json
{
  "goals": "I need to learn machine learning for data science",
  "preferences": "Include Python fundamentals, statistical concepts, and practical ML projects"
}
```

#### Expected Response
```json
{
  "path": {
    "overview": "This learning path will guide you through full-stack web development...",
    "steps": [
      {
        "order": 1,
        "title": "HTML & CSS Fundamentals",
        "description": "Master the building blocks of web development",
        "estimatedTime": "1-2 weeks",
        "resources": ["MDN Web Docs", "CSS-Tricks"]
      },
      {
        "order": 2,
        "title": "JavaScript Basics",
        "description": "Learn core JavaScript concepts",
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

### Get Learning Path
**Endpoint:** `GET /api/learning-path`

No request body needed.

#### Expected Response
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

---

## 🆕 Feature 3: Explain Hard Concepts

### Step 1: Create a Material First

**Endpoint:** `POST /api/materials`

#### Mock Request Body
```json
{
  "fileName": "machine-learning-fundamentals.pdf",
  "storagePath": "test-user/machine-learning-fundamentals.pdf",
  "fileType": "pdf"
}
```

#### Expected Response (Save the `_id`)
```json
{
  "_id": "65a1b2c3d4e5f6a7b8c9d0e2",
  "fileName": "machine-learning-fundamentals.pdf",
  "storagePath": "test-user/machine-learning-fundamentals.pdf",
  "fileType": "pdf",
  "user": "65a1b2c3d4e5f6a7b8c9d0e1",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**⚠️ Important:** Copy the `_id` from the response above (e.g., `65a1b2c3d4e5f6a7b8c9d0e2`)

### Step 2: Explain Concepts

**Endpoint:** `POST /api/materials/:id/explain-concepts`

Replace `:id` with the material `_id` from Step 1.

#### Mock Request Body 1 (English - Default)
```json
{
  "language": "English"
}
```

#### Mock Request Body 2 (Spanish)
```json
{
  "language": "Spanish"
}
```

#### Mock Request Body 3 (French)
```json
{
  "language": "French"
}
```

#### Mock Request Body 4 (Minimal - Uses Default)
```json
{}
```

#### Expected Response
```json
{
  "concepts": [
    {
      "concept": "Neural Networks",
      "explanation": "A neural network is a computing system inspired by biological neural networks. It consists of interconnected nodes (neurons) that process information...",
      "difficulty": 4,
      "examples": [
        "Think of it like the human brain with interconnected neurons",
        "Similar to how multiple layers of filters process an image"
      ],
      "prerequisites": ["Linear Algebra", "Calculus", "Basic Statistics"]
    },
    {
      "concept": "Backpropagation",
      "explanation": "Backpropagation is an algorithm for training neural networks. It calculates the gradient of the loss function with respect to the weights by propagating errors backward through the network...",
      "difficulty": 5,
      "examples": [
        "Like learning from mistakes and adjusting your approach",
        "Similar to refining your technique after each practice session"
      ],
      "prerequisites": ["Neural Networks", "Gradient Descent", "Chain Rule"]
    },
    {
      "concept": "Overfitting",
      "explanation": "Overfitting occurs when a model learns the training data too well, including noise and irrelevant details, which makes it perform poorly on new, unseen data...",
      "difficulty": 3,
      "examples": [
        "Like memorizing answers instead of understanding concepts",
        "Similar to a student who only studies exam questions without understanding the subject"
      ],
      "prerequisites": ["Model Training", "Validation Sets"]
    }
  ],
  "language": "English",
  "cached": false,
  "id": "65a1b2c3d4e5f6a7b8c9d0e3"
}
```

---

## 📋 Quick Copy-Paste Test Sequence

### 1️⃣ Test General Chat
```bash
POST http://localhost:5001/api/chat/general

Body:
{
  "message": "Explain quantum computing in simple terms",
  "history": []
}
```

### 2️⃣ Create Material
```bash
POST http://localhost:5001/api/materials

Body:
{
  "fileName": "test-ai-concepts.pdf",
  "storagePath": "test-user/test-ai-concepts.pdf",
  "fileType": "pdf"
}

# Copy the _id from response
```

### 3️⃣ Test Explain Concepts
```bash
POST http://localhost:5001/api/materials/YOUR_MATERIAL_ID/explain-concepts

Body:
{
  "language": "English"
}
```

### 4️⃣ Test Learning Path Generation
```bash
POST http://localhost:5001/api/learning-path/generate

Body:
{
  "goals": "I want to become a data scientist",
  "preferences": "Focus on Python, statistics, and machine learning"
}
```

### 5️⃣ Get Learning Path
```bash
GET http://localhost:5001/api/learning-path
```

---

## 🎯 Postman Quick Setup

### Method 1: Manual Setup

1. Create New Collection: "New Features Test"
2. Add Environment Variable:
   - Variable: `baseUrl`
   - Value: `http://localhost:5001/api`

3. For each endpoint below, create a new request in Postman:

---

### Method 2: Import This Collection

Save as `new-features-collection.json` and import into Postman:

```json
{
  "info": {
    "name": "New Features - Quick Test",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5001/api",
      "type": "string"
    },
    {
      "key": "materialId",
      "value": "",
      "type": "string"
    }
  ],
  "item": [
    {
      "name": "1. General Chat",
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
          "raw": "{\n  \"message\": \"What is artificial intelligence?\",\n  \"history\": []\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "{{baseUrl}}/chat/general",
          "host": ["{{baseUrl}}"],
          "path": ["chat", "general"]
        }
      }
    },
    {
      "name": "2. Create Material",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "if (pm.response.code === 201) {",
              "  const jsonData = pm.response.json();",
              "  pm.collectionVariables.set('materialId', jsonData._id);",
              "  console.log('Material ID saved:', jsonData._id);",
              "}"
            ],
            "type": "text/javascript"
          }
        }
      ],
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
          "raw": "{\n  \"fileName\": \"machine-learning-fundamentals.pdf\",\n  \"storagePath\": \"test-user/machine-learning-fundamentals.pdf\",\n  \"fileType\": \"pdf\"\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "{{baseUrl}}/materials",
          "host": ["{{baseUrl}}"],
          "path": ["materials"]
        }
      }
    },
    {
      "name": "3. Explain Concepts",
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
          "raw": "{\n  \"language\": \"English\"\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "{{baseUrl}}/materials/{{materialId}}/explain-concepts",
          "host": ["{{baseUrl}}"],
          "path": ["materials", "{{materialId}}", "explain-concepts"]
        }
      }
    },
    {
      "name": "4. Generate Learning Path",
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
          "raw": "{\n  \"goals\": \"I want to master full-stack web development\",\n  \"preferences\": \"Focus on React and Node.js\"\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "{{baseUrl}}/learning-path/generate",
          "host": ["{{baseUrl}}"],
          "path": ["learning-path", "generate"]
        }
      }
    },
    {
      "name": "5. Get Learning Path",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/learning-path",
          "host": ["{{baseUrl}}"],
          "path": ["learning-path"]
        }
      }
    }
  ]
}
```

---

## ✅ Test Checklist

- [ ] General Chat returns AI response
- [ ] Material created successfully (save the ID)
- [ ] Explain Concepts returns concept array (may need actual file in storage)
- [ ] Learning Path generates successfully
- [ ] Learning Path can be retrieved

---

## 🐛 Common Issues

**Issue:** "File parsing failed" for Explain Concepts  
**Solution:** The endpoint needs an actual file in Supabase Storage. For testing without a file, the endpoint will fail at the file download step.

**Issue:** "Material not found"  
**Solution:** Make sure you created the material first and copied the correct `_id`.

**Issue:** 500 Error  
**Solution:** Check that `GEMINI_API_KEY` is set in `.env` and valid.

---

## 🚀 Ready to Test!

Just copy-paste the requests above into Postman or use the collection JSON. Happy testing! 🎉

