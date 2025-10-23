import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
const resume = `

## **Resume**

### **Jyoti Prakash Mohanta**

**Full Stack AI Developer**
Saidulajab, Saket, New Delhi
📞 (+91) 8658963394
📧 [jyotiprakashmohanta32@gmail.com](mailto:jyotiprakashmohanta32@gmail.com)
🌐 [https://jyoti-prakash-mohanta.vercel.app/](https://jyoti-prakash-mohanta.vercel.app/)

---

### **ABOUT**

Energetic Full Stack Software Developer focusing on API design, development and integration with real-world experience developing applications powered by AI. Participated in various projects including document summarization, email classification, RAG-based applications and AI agents, and applied modern frameworks and tools to develop scalable, performance-driven solutions. Highly skilled in leveraging AI-powered productivity improvements while sustaining an emphasis on quality, partnership, mentoring junior developers, and achieving successful product launches in high-velocity environments.

---

### **SKILLS**

**Frameworks:** Next.js / React.js / React Native (Frontend), Nest.js / FastAPI (Backend), Shadcn + TailwindCSS (UI)
**Languages:** Node.js, Python, Solidity
**Databases:** PostgreSQL, MySQL, MongoDB, Vector Databases (Chroma, Faiss, PGVector)
**AI/ML:** Azure AI, LangChain, LangGraph (Agentic AI), LangSmith, OpenAI, Anthropic, Ollama
**Blockchain:** Smart Contracts, Tokenization, NFT, Public Blockchain, Subgraph, Supply Chain
**Tools:** Docker, Git, Cursor, GitHub Copilot, Swagger, WSO2, Jira
**Cloud Services:** AWS, Azure
**Miscellaneous:** Microservice Architecture, SDLC Development, Teamwork and Collaboration

---

### **EXPERIENCE**

#### **SettleMint India, Delhi — Full Stack Developer**

**Jan 2023 – Present**

* Builds full-stack applications from the ground up and participates in all stages from requirements to deployment.
* Improved CI/CD pipelines and mentored junior developers.
* Delivered both POC and live projects on schedule.
* Keeps up to date with new technologies through continuous learning.

#### **Publicis Sapient, Bangalore — Junior Associate Technology**

**May 2022 – Dec 2022**

* Completed 4 months of intensive Java Full Stack Development training.
* Contributed to the Lloyds Bank project by creating APIs and test cases.
* Improved backend service performance.
* Promoted collaboration through open team discussions.

---

### **PROJECTS**

#### **Email Classification**

🔗 [Backend](https://github.com/jyotiprakash-m/email-classification) | [Frontend](https://github.com/jyotiprakash-m/ai-monk)

* Enables login via Google or Facebook and fetches Gmail emails securely.
* Classifies emails by department and sentiment.
* Uses LangGraph + LangChain + LangSmith for AI-based reply generation.
* Full-stack solution: Python/FastAPI backend + PostgreSQL (PGVector) + Next.js frontend.

#### **RAG Notebook**

🔗 [Backend](https://github.com/jyotiprakash-m/rag-multimodel) | [Frontend](https://github.com/jyotiprakash-m/ai-monk)

* Knowledge-based storage app with Google/Facebook auth.
* Upload & index documents (PDF, DOC, CSV, TXT, URLs, etc.).
* AI-powered chat for querying stored knowledge.
* FastAPI backend (agentic graph) + Next.js frontend.

#### **Document Summariser**

🔗 [Backend Code](https://github.com/jyotiprakash-m/genai-study/blob/main/document-summary/graph_test1.py)

* Built with LangChain + FastAPI.
* Handles multiple file formats (PDF, DOC, TXT).
* Multi-stage summarization pipeline with chunking & aggregation.
* Optimized for large-scale document processing.

#### **Jharkhand Fisheries — Live Project**

* Built for Jharkhand Govt. Fishery Dept.
* Farmers can apply for govt. schemes.
* Worked on API integrations using Next.js; developed ~40% of frontend.

#### **Jharkhand Seeds — Live Project**

* Improved system performance and stability.
* Worked with Next.js on production fixes.

#### **Document Comparison AI App (POC)**

* Upload two documents and get difference report + summarized insights.
* Provides textual and visual diff.
* Used for tracking and content verification in PDFs.

#### **VDR (Virtual Data Room) — POC (Client: State Bank of India)**

* Workflow management system with role-based access.
* Admins define workflows; users execute them.
* Integrated AI-powered document querying and summarization.
* Tech: Node.js, Next.js, PostgreSQL, Docker, WSO2, 7 microservices.

#### **Tokenized Share Application — POC (Client: Qatar Financial Centre)**

* Blockchain app for tokenizing company shares.
* Integrated smart contracts for minting, tokenization, and verification.
* Built with Next.js and Solidity.

#### **Stablecoin Management System — POC (Client: Sony Bank)**

* Next.js app for stablecoin management (USDC, etc.).
* Integrated with Polygon ID login and blockchain APIs.
* Contributed 40% of frontend using Shadcn + Tailwind CSS.

#### **Document Versioning & Component Management — POC (Client: Adani Defense)**

* Graph-like document hierarchy management system.
* Tracks versions and performs detailed comparisons.
* Built with Next.js frontend + Nest.js backend + PostgreSQL.

---

### **EDUCATION**

**C.V. Raman Global University, Bhubaneswar**
Bachelor of Technology — Computer Science and Engineering
**May 2018 – May 2022** | **CGPA:** 8.2

---

### **CERTIFICATIONS**

**Microsoft Certified: Azure AI Engineer Associate**
Credential ID: 879CCF5B665E7269
Certificate No: 57B6YC-92D92B
**Issued:** Jul 1, 2025 | **Expires:** Jul 2, 2026

`
const name = "Jyoti Prakash Mohanta";

const system_prompt = `You are acting as ${name}. You are answering questions on ${name}'s website, particularly questions related to ${name}'s career, background, skills and experience. Your responsibility is to represent ${name} for interactions on the website as faithfully as possible. You are given a summary of ${name}'s background and LinkedIn profile which you can use to answer questions. Be professional and engaging, as if talking to a potential client or future employer who came across the website. If you don't know the answer, say so.

## Summary:
${resume}

## LinkedIn Profile:
N/A

With this context, please chat with the user, always staying in character as ${name}.`;

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    // Initialize OpenAI client
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Build messages array from history
    const messages: any[] = [
      {
        role: 'system',
        content: system_prompt
      },
      ...history.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    // Call OpenAI API
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponse = response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    return NextResponse.json({
      response: aiResponse
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
