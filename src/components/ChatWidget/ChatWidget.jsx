import React, { useState } from "react";
import axios from "axios";
import "./ChatWidget.css";

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);

    const toggleChat = () => setIsOpen(!isOpen);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");

        try {
            const res = await axios.post("https://hmall.harmon.love:14443/chat", {
                prompt: input,
            });

            const data = res.data;
            if (data.message) {
                const botMsg = {
                    role: "bot",
                    content: data.message,
                    products: data.products || [],
                };
                setMessages((prev) => [...prev, botMsg]);
            }
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                { role: "bot", content: "Xin lỗi, có lỗi khi kết nối đến máy chủ 😢" },
            ]);
        }
    };

    const formatMessage = (text) => {
        const parts = text.split(/(\*\*.*?\*\*|\n)/g);
        return parts.map((part, i) => {
            if (part.startsWith("**") && part.endsWith("**")) {
                return (
                    <strong key={i}>{part.replace(/\*\*/g, "")}</strong>
                );
            } else if (part === "\n") {
                return <br key={i} />;
            }
            return part;
        });
    };

    return (
        <>
            <div className="chat-button" onClick={toggleChat}>
                <img
                    src="https://www.freeiconspng.com/uploads/live-chat-icon-13.png"
                    alt="Chat"
                    className="chat-icon"
                />
            </div>

            {isOpen && (
                <div className="chatbox shadow-lg">
                    <div className="chatbox-header">
                        <span>HMall Chat 💬</span>
                        <button className="close-btn" onClick={toggleChat}>
                            ✕
                        </button>
                    </div>

                    <div className="chatbox-body">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`chat-message ${msg.role === "user" ? "user" : "bot"
                                    }`}
                            >
                                <div className="message-content">
                                    {formatMessage(msg.content)}
                                </div>

                                {msg.products?.length > 0 && (
                                    <div className="product-list">
                                        {msg.products.map((p) => (
                                            <div className="product-card" key={p.ID}>
                                                <div className="p-name">{p.Name}</div>
                                                <div className="p-price">
                                                    Giá: {p.Price.toLocaleString("vi-VN")}đ
                                                </div>
                                                <div className="p-stock">
                                                    Tồn kho: {p.Stock} | {p.Category}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="chatbox-footer">
                        <form
                            className="chatbox-footer"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSend();
                            }}
                        >
                            <input
                                type="text"
                                placeholder="Nhập tin nhắn..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            <button type="submit">Gửi</button>
                        </form>

                    </div>
                </div>
            )}
        </>
    );
};

export default ChatWidget;
