# 🚀 Frontend Integration Guide - New API Endpoints

## 📋 Overview

This guide provides all the information needed to integrate the three new features into your frontend application.

**Base URL:** `http://localhost:5001/api` (or your production API URL)

---

## 🔐 Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Note:** For testing with `DISABLE_AUTH=true`, authentication is bypassed, but in production, all requests must include a valid token.

---

## 📡 Endpoint 1: General Chat Bot (ChatGPT-like)

### Overview
A general-purpose chatbot that can answer questions about learning, education, and general topics. Not tied to any specific document.

### Endpoint
```
POST /api/chat/general
```

### Headers
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

### Request Body
```typescript
{
  message: string;      // Required: User's message/question
  history?: Array<{     // Optional: Conversation history
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
  }>;
}
```

### Request Example
```javascript
const response = await fetch('http://localhost:5001/api/chat/general', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    message: "What is machine learning?",
    history: [] // Empty for first message
  })
});

const data = await response.json();
```

### Response Format
```typescript
{
  response: string;           // AI's response text
  timestamp: string;          // ISO 8601 timestamp
}
```

### Response Example
```json
{
  "response": "Machine learning is a subset of artificial intelligence...",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Responses

**400 Bad Request:**
```json
{
  "message": "A message is required."
}
```

**401 Unauthorized:**
```json
{
  "message": "Not authorized, no token"
}
```

**500 Server Error:**
```json
{
  "message": "Failed to get a response.",
  "error": "Error details..."
}
```

### React Example (with Conversation History)

```javascript
import { useState } from 'react';

function GeneralChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setLoading(true);

    // Add user message to UI
    const newMessages = [...messages, { role: 'user', text: userMessage }];
    setMessages(newMessages);

    try {
      const response = await fetch('/api/chat/general', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: userMessage,
          // Convert messages to API format
          history: messages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Add AI response to UI
      setMessages([
        ...newMessages,
        { role: 'model', text: data.response }
      ]);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask me anything..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
```

---

## 📚 Endpoint 2: Learning Path Generation

### Overview
Generates a personalized learning path based on user's existing materials and learning goals.

### Endpoint: Generate Learning Path
```
POST /api/learning-path/generate
```

### Headers
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

### Request Body
```typescript
{
  goals: string;              // Required: User's learning goals
  preferences?: string;       // Optional: Learning preferences
}
```

### Request Example
```javascript
const response = await fetch('http://localhost:5001/api/learning-path/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    goals: "I want to master full-stack web development",
    preferences: "Focus on React and Node.js, include hands-on projects"
  })
});

const data = await response.json();
```

### Response Format
```typescript
{
  path: {
    overview: string;
    steps: Array<{
      order: number;
      title: string;
      description: string;
      estimatedTime: string;
      resources: string[];
    }>;
    estimatedTotalTime: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Mixed';
    prerequisites: string[];
  };
  cached: boolean;           // Whether result was from cache
  id: string;                // Learning path ID
  createdAt?: string;        // ISO timestamp (if new)
  updatedAt?: string;        // ISO timestamp (if cached)
}
```

### Response Example
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

---

### Endpoint: Get Learning Path
```
GET /api/learning-path
```

### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Request Example
```javascript
const response = await fetch('http://localhost:5001/api/learning-path', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
```

### Response Format (Same as Generate)
```typescript
{
  path: {
    overview: string;
    steps: Array<LearningStep>;
    estimatedTotalTime: string;
    difficulty: string;
    prerequisites: string[];
  };
  id: string;
  createdAt: string;
  updatedAt: string;
}
```

### Error Responses

**400 Bad Request:**
```json
{
  "message": "Learning goals are required."
}
```

**404 Not Found (for GET):**
```json
{
  "message": "No learning path found. Please generate one first."
}
```

**500 Server Error:**
```json
{
  "message": "Failed to generate learning path.",
  "error": "Error details..."
}
```

### React Example: Learning Path Component

```javascript
import { useState, useEffect } from 'react';

function LearningPath() {
  const [path, setPath] = useState(null);
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState('');
  const [preferences, setPreferences] = useState('');

  // Load existing learning path on mount
  useEffect(() => {
    loadLearningPath();
  }, []);

  const loadLearningPath = async () => {
    try {
      const response = await fetch('/api/learning-path', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPath(data.path);
      } else if (response.status !== 404) {
        throw new Error('Failed to load learning path');
      }
    } catch (error) {
      console.error('Error loading learning path:', error);
    }
  };

  const generatePath = async () => {
    if (!goals.trim()) {
      alert('Please enter your learning goals');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/learning-path/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          goals,
          preferences: preferences || undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate learning path');
      }

      const data = await response.json();
      setPath(data.path);
      setGoals('');
      setPreferences('');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate learning path');
    } finally {
      setLoading(false);
    }
  };

  if (!path) {
    return (
      <div className="learning-path-generator">
        <h2>Create Your Learning Path</h2>
        <div className="form-group">
          <label>Learning Goals *</label>
          <textarea
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="e.g., I want to master full-stack web development"
            rows={4}
          />
        </div>
        <div className="form-group">
          <label>Preferences (Optional)</label>
          <textarea
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            placeholder="e.g., Focus on React and Node.js"
            rows={3}
          />
        </div>
        <button onClick={generatePath} disabled={loading || !goals.trim()}>
          {loading ? 'Generating...' : 'Generate Learning Path'}
        </button>
      </div>
    );
  }

  return (
    <div className="learning-path">
      <div className="path-header">
        <h2>Your Learning Path</h2>
        <button onClick={() => setPath(null)}>Create New Path</button>
      </div>
      
      <div className="path-overview">
        <p>{path.overview}</p>
        <div className="path-meta">
          <span>Difficulty: {path.difficulty}</span>
          <span>Estimated Time: {path.estimatedTotalTime}</span>
        </div>
      </div>

      {path.prerequisites.length > 0 && (
        <div className="prerequisites">
          <h3>Prerequisites</h3>
          <ul>
            {path.prerequisites.map((preq, idx) => (
              <li key={idx}>{preq}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="path-steps">
        {path.steps.map((step) => (
          <div key={step.order} className="step-card">
            <div className="step-number">{step.order}</div>
            <div className="step-content">
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              <div className="step-meta">
                <span className="time">⏱️ {step.estimatedTime}</span>
                {step.resources.length > 0 && (
                  <div className="resources">
                    <strong>Resources:</strong>
                    <ul>
                      {step.resources.map((resource, idx) => (
                        <li key={idx}>{resource}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🎓 Endpoint 3: Explain Hard Concepts from Documents

### Overview
Identifies and explains difficult concepts from an uploaded document in a preferred language.

### Prerequisites
Before using this endpoint, you need to have a material (document) already uploaded. You'll need the material's ID.

### Endpoint
```
POST /api/materials/:id/explain-concepts
```

**Note:** Replace `:id` with the actual material ID.

### Headers
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

### Request Body
```typescript
{
  language?: string;  // Optional: Language for explanations (default: "English")
}
```

### Request Example
```javascript
const materialId = '65a1b2c3d4e5f6a7b8c9d0e2';

const response = await fetch(
  `http://localhost:5001/api/materials/${materialId}/explain-concepts`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      language: 'English' // Optional, defaults to English
    })
  }
);

const data = await response.json();
```

### Response Format
```typescript
{
  concepts: Array<{
    concept: string;           // Concept name
    explanation: string;       // Detailed explanation
    difficulty: number;        // 1-5 scale (5 = hardest)
    examples: string[];        // Examples/analogies
    prerequisites: string[];   // Prerequisites to understand
  }>;
  language: string;            // Language used
  cached: boolean;             // Whether result was from cache
  id: string;                  // Generated content ID
}
```

### Response Example
```json
{
  "concepts": [
    {
      "concept": "Neural Networks",
      "explanation": "A neural network is a computing system inspired by biological neural networks...",
      "difficulty": 4,
      "examples": [
        "Think of it like the human brain with interconnected neurons",
        "Similar to how multiple layers of filters process an image"
      ],
      "prerequisites": ["Linear Algebra", "Calculus", "Basic Statistics"]
    },
    {
      "concept": "Backpropagation",
      "explanation": "Backpropagation is an algorithm for training neural networks...",
      "difficulty": 5,
      "examples": [
        "Like learning from mistakes and adjusting your approach",
        "Similar to refining your technique after each practice session"
      ],
      "prerequisites": ["Neural Networks", "Gradient Descent"]
    }
  ],
  "language": "English",
  "cached": false,
  "id": "65a1b2c3d4e5f6a7b8c9d0e3"
}
```

### Error Responses

**400 Bad Request:**
```json
{
  "message": "Could not process the uploaded file.",
  "error": "Error details..."
}
```

**401 Unauthorized:**
```json
{
  "message": "User not authorized"
}
```

**404 Not Found:**
```json
{
  "message": "Material not found"
}
```

**500 Server Error:**
```json
{
  "message": "Failed to generate concept explanations.",
  "error": "Error details..."
}
```

### React Example: Concept Explanation Component

```javascript
import { useState } from 'react';

function ConceptExplainer({ materialId }) {
  const [concepts, setConcepts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('English');
  const [error, setError] = useState(null);

  const explainConcepts = async () => {
    if (!materialId) {
      setError('Material ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/materials/${materialId}/explain-concepts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            language: language || 'English'
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to explain concepts');
      }

      const data = await response.json();
      setConcepts(data.concepts);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    if (difficulty <= 2) return '#4CAF50'; // Green
    if (difficulty <= 3) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getDifficultyLabel = (difficulty) => {
    if (difficulty <= 2) return 'Easy';
    if (difficulty <= 3) return 'Medium';
    return 'Hard';
  };

  return (
    <div className="concept-explainer">
      <div className="explainer-header">
        <h2>Explain Hard Concepts</h2>
        <div className="language-selector">
          <label>Language:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={loading}
          >
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
            <option value="Portuguese">Portuguese</option>
          </select>
        </div>
        <button
          onClick={explainConcepts}
          disabled={loading || !materialId}
        >
          {loading ? 'Analyzing...' : 'Explain Concepts'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {concepts && (
        <div className="concepts-list">
          <h3>Identified Concepts ({concepts.length})</h3>
          {concepts.map((concept, idx) => (
            <div key={idx} className="concept-card">
              <div className="concept-header">
                <h4>{concept.concept}</h4>
                <span
                  className="difficulty-badge"
                  style={{
                    backgroundColor: getDifficultyColor(concept.difficulty)
                  }}
                >
                  {getDifficultyLabel(concept.difficulty)} ({concept.difficulty}/5)
                </span>
              </div>

              <div className="concept-explanation">
                <p>{concept.explanation}</p>
              </div>

              {concept.examples.length > 0 && (
                <div className="concept-examples">
                  <strong>Examples:</strong>
                  <ul>
                    {concept.examples.map((example, exIdx) => (
                      <li key={exIdx}>{example}</li>
                    ))}
                  </ul>
                </div>
              )}

              {concept.prerequisites.length > 0 && (
                <div className="concept-prerequisites">
                  <strong>Prerequisites:</strong>
                  <div className="prerequisite-tags">
                    {concept.prerequisites.map((preq, preqIdx) => (
                      <span key={preqIdx} className="tag">
                        {preq}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Usage example:
// <ConceptExplainer materialId="65a1b2c3d4e5f6a7b8c9d0e2" />
```

---

## 🔧 TypeScript Types

For TypeScript projects, here are the type definitions:

```typescript
// General Chat Types
interface ChatMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

interface GeneralChatRequest {
  message: string;
  history?: ChatMessage[];
}

interface GeneralChatResponse {
  response: string;
  timestamp: string;
}

// Learning Path Types
interface LearningStep {
  order: number;
  title: string;
  description: string;
  estimatedTime: string;
  resources: string[];
}

interface LearningPath {
  overview: string;
  steps: LearningStep[];
  estimatedTotalTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Mixed';
  prerequisites: string[];
}

interface LearningPathResponse {
  path: LearningPath;
  cached: boolean;
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

interface GenerateLearningPathRequest {
  goals: string;
  preferences?: string;
}

// Concept Explanation Types
interface Concept {
  concept: string;
  explanation: string;
  difficulty: number; // 1-5
  examples: string[];
  prerequisites: string[];
}

interface ExplainConceptsResponse {
  concepts: Concept[];
  language: string;
  cached: boolean;
  id: string;
}

interface ExplainConceptsRequest {
  language?: string;
}
```

---

## 🎨 Styling Tips

### CSS Example for Learning Path Steps

```css
.path-steps {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.step-card {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
}

.step-number {
  min-width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #2196F3;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.step-content h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.step-content p {
  color: #666;
  margin: 0.5rem 0;
}

.step-meta {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.time {
  color: #666;
  font-size: 0.9rem;
}

.resources ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}
```

### CSS Example for Concept Cards

```css
.concept-card {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
}

.concept-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.concept-header h4 {
  margin: 0;
  color: #333;
}

.difficulty-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
}

.concept-explanation {
  margin: 1rem 0;
  line-height: 1.6;
  color: #444;
}

.prerequisite-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 4px;
  font-size: 0.875rem;
}
```

---

## ✅ Integration Checklist

- [ ] Set up base URL configuration
- [ ] Implement authentication token storage/retrieval
- [ ] Create API service functions for each endpoint
- [ ] Add error handling for all API calls
- [ ] Implement loading states
- [ ] Create UI components for each feature
- [ ] Add TypeScript types (if using TypeScript)
- [ ] Test all endpoints with actual data
- [ ] Handle edge cases (empty responses, errors)
- [ ] Add proper loading indicators
- [ ] Implement retry logic for failed requests
- [ ] Add user feedback for success/error states

---

## 🐛 Common Issues & Solutions

### Issue: CORS Errors
**Solution:** Ensure your backend has CORS enabled and your frontend URL is whitelisted.

### Issue: 401 Unauthorized
**Solution:** Check that:
- Token is included in Authorization header
- Token format is: `Bearer YOUR_TOKEN`
- Token hasn't expired

### Issue: Material not found (for concept explanation)
**Solution:** Ensure:
- Material ID is correct
- Material exists and belongs to the authenticated user
- Material was created before trying to explain concepts

### Issue: Empty or incomplete responses
**Solution:** Check:
- API key is valid
- Request body format is correct
- Required fields are included

---

## 📞 Support

If you encounter any issues or have questions about integrating these endpoints, please refer to:
- Backend API documentation
- Server logs for detailed error messages
- Network tab in browser dev tools for request/response details

---

**Happy Coding! 🚀**

