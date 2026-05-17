import React, { useState, useRef, useEffect } from 'react';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentRecommendations, setCurrentRecommendations] = useState([]);
  const messagesEndRef = useRef(null);

  // Points directly to your local running FastAPI server port
 const BACKEND_URL = "https://shl-assessment-backend-egoe.onrender.com/chat";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };
    const updatedHistory = [...messages, userMessage];
    
    setMessages(updatedHistory);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: updatedHistory }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply }
      ]);

      if (data.recommendations && data.recommendations.length > 0) {
        setCurrentRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error("Connection Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Could not connect to the backend server. Please verify your FastAPI app is running on port 8000." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100screen', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f3f4f6', margin: 0 }}>
      
      {/* LEFT PANEL: CHAT */}
      <div style={{ display: 'flex', flexDirection: 'col', flexDirection: 'column', width: '500px', borderRight: '1px solid #e5e7eb', backgroundColor: '#ffffff' }}>
        {/* Header */}
        <div style={{ padding: '16px', backgroundColor: '#0f172a', color: '#ffffff' }}>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>SHL Assessment Assistant</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#cbd5e1' }}>Conversational Recruiter Interface</p>
        </div>

        {/* Message Log */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '40px', padding: '0 20px', fontSize: '14px' }}>
              <p>Type your recruitment requirements or paste a job description below to generate a tailored SHL assessment shortlist.</p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '75%',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '14px',
                lineHeight: '1.4',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                backgroundColor: msg.role === 'user' ? '#2563eb' : '#f3f4f6',
                color: msg.role === 'user' ? '#ffffff' : '#1f2937',
                borderBottomRightRadius: msg.role === 'user' ? '0' : '8px',
                borderBottomLeftRadius: msg.role === 'assistant' ? '0' : '8px',
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ backgroundColor: '#f3f4f6', color: '#9ca3af', fontSize: '14px', padding: '10px 14px', borderRadius: '8px', fontStyle: 'italic' }}>
                Analyzing catalog parameters...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Form Input */}
        <form onSubmit={handleSendMessage} style={{ padding: '16px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb', display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., 'I need to screen a senior Java developer...'"
            style={{ flex: 1, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', outline: 'none' }}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}
          >
            Send
          </button>
        </form>
      </div>

      {/* RIGHT PANEL: LIVE ASSESSMENT SHORTLIST */}
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>Matched SHL Shortlist</h2>
        <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#64748b' }}>Deterministic matches pulled securely from your local indexed catalog registry.</p>

        {currentRecommendations.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', itemsCenter: 'center', justifyContent: 'center', border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '40px', color: '#9ca3af', textAlign: 'center', flexDirection: 'column' }}>
            <p style={{ fontSize: '14px' }}>Provide structured constraints or role context in the chat panel to output target recommendation models.</p>
          </div>
        ) : (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', margin: 0, fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f172a', color: '#ffffff', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Assessment Name</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'center' }}>Type</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'right' }}>Catalog Link</th>
                </tr>
              </thead>
              <tbody>
                {currentRecommendations.map((rec, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '500', color: '#1f2937' }}>{rec.name}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        backgroundColor: rec.test_type === 'K' ? '#f3e8ff' : rec.test_type === 'P' ? '#ffedd5' : '#dcfce7',
                        color: rec.test_type === 'K' ? '#6b21a8' : rec.test_type === 'P' ? '#9a3412' : '#166534'
                      }}>
                        {rec.test_type}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <a
  href={
    rec.url && !rec.url.includes("it-simulation") 
      ? rec.url 
      : `https://www.shl.com/search/?q=${encodeURIComponent(rec.name)}`
  }
  target="_blank"
  rel="noopener noreferrer"
  style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500', fontSize: '13px' }}
>
  Open Official Page →
</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}