import React, { useState, useEffect } from 'react';
import { HelpCircle, MessageSquare, Send, Bot } from 'lucide-react';
import { apiRequest } from '../services/api';

export const SupportPage: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('ORDER_STATUS');
  const [description, setDescription] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      sender: 'bot',
      text: 'Hello! I am your FOODORA Assistant. You can ask about order status, delivery estimates, cancellation rules, or submit a support ticket below.'
    }
  ]);

  useEffect(() => {
    apiRequest('/support/tickets').then((res) => {
      if (res.success && res.data) setTickets(res.data);
    });
  }, []);

  const handleChatSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    const newChat = [...chatMessages, { sender: 'user', text: userText }];
    setChatMessages(newChat);
    setChatInput('');

    // Instant Rule-Based Knowledge Assistant
    let reply = 'Thank you for reaching out. If you have an urgent inquiry regarding an ongoing order, please submit a support ticket below and an admin will assist you promptly.';
    const lower = userText.toLowerCase();

    if (lower.includes('cancel') || lower.includes('refund')) {
      reply = 'Cancellation Policy: Orders can be cancelled while in the "PLACED" status before the kitchen starts preparation. Once food is on the stove, cancellations are restricted.';
    } else if (lower.includes('pin') || lower.includes('dropoff') || lower.includes('code')) {
      reply = 'Delivery Verification: Each order has a 4-digit Dropoff PIN displayed on the Order Tracking page. Share this PIN with the courier upon arrival.';
    } else if (lower.includes('reward') || lower.includes('point') || lower.includes('loyalty')) {
      reply = 'Loyalty Rewards: You earn 10 points for every $1 spent. Every 100 points can be redeemed for $1.00 off right at the checkout screen!';
    } else if (lower.includes('delivery time') || lower.includes('eta') || lower.includes('late')) {
      reply = 'Delivery Tracking: You can follow the live status progression and arrival estimate at any time in the "My Orders" tracking page.';
    }

    setTimeout(() => {
      setChatMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
    }, 400);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/support/tickets', {
        method: 'POST',
        body: JSON.stringify({ category, subject, description })
      });
      if (res.success && res.data) {
        setTickets([res.data, ...tickets]);
        setSubject('');
        setDescription('');
        alert('Ticket submitted successfully!');
      }
    } catch (err: any) {
      alert(err.message || 'Error creating ticket');
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)' }}>
          Help & Customer Support
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Get instant answers from our virtual assistant or submit a resolution ticket
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
        {/* Support Chatbot */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '520px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', background: 'var(--secondary)', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bot size={22} color="var(--primary)" />
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>FOODORA Instant Assistant</h3>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Automated Support & Knowledge Guide</p>
            </div>
          </div>

          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  background: msg.sender === 'user' ? 'var(--primary)' : 'var(--bg-subtle)',
                  color: msg.sender === 'user' ? 'white' : 'var(--text-main)',
                  padding: '10px 14px',
                  borderRadius: '16px',
                  fontSize: '0.85rem',
                  lineHeight: '1.4'
                }}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleChatSend} style={{ display: 'flex', padding: '12px', borderTop: '1px solid var(--border-subtle)', gap: '8px' }}>
            <input
              type="text"
              placeholder="Ask about cancellation, PIN, loyalty..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-full)' }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '8px 14px' }}>
              <Send size={16} />
            </button>
          </form>
        </div>

        {/* Submit Ticket & History */}
        <div>
          <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>Submit a Support Ticket</h3>
            <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
              >
                <option value="ORDER_STATUS">Order Inquiry</option>
                <option value="LATE_DELIVERY">Delayed Delivery</option>
                <option value="PAYMENT_ISSUE">Payment / Billing</option>
                <option value="FOOD_QUALITY">Food Quality Feedback</option>
                <option value="OTHER">Other Questions</option>
              </select>

              <input
                type="text"
                placeholder="Ticket Subject"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{ padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
              />

              <textarea
                rows={3}
                placeholder="Describe your issue with order number if applicable..."
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
              />

              <button type="submit" className="btn-primary" style={{ padding: '10px', justifyContent: 'center' }}>
                Submit Ticket
              </button>
            </form>
          </div>

          {/* Ticket History */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '16px' }}>My Active Tickets</h3>
            {tickets.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No submitted tickets.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {tickets.map((t) => (
                  <div key={t._id} style={{ padding: '12px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{t.ticketNumber}: {t.subject}</span>
                      <span className="badge badge-primary">{t.status}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.description}</p>
                    {t.adminResponse && (
                      <div style={{ marginTop: '6px', background: '#F0FDF4', padding: '6px 10px', borderRadius: '4px', fontSize: '0.8rem', color: '#166534' }}>
                        <b>Admin:</b> {t.adminResponse}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
