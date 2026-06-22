import { useState } from "react";
import "./App.css";

type Role = "RIDER" | "DRIVER";
type View = "landing" | "auth" | "register" | "login" | "chat" | "driver";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Location = { id: number; city: string };

function App() {
  const [view, setView] = useState<View>("landing");
  const [selectedRole, setSelectedRole] = useState<Role>("RIDER");
  const [userEmail, setUserEmail] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [profile, setProfile] = useState({ phoneNumber: "", vehicleModel: "", pricePerMile: "" });
  const [locations, setLocations] = useState<Location[]>([]);
  const [newCity, setNewCity] = useState("");
  const [available, setAvailable] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your DriveMe assistant. Where do you need to go?" }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setView("auth");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch("http://localhost:8080/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role: selectedRole }),
      });
      if (!response.ok) {
        const msg = await response.text();
        setError(msg || "Registration failed");
        return;
      }
      setUserEmail(form.email);
      setView(selectedRole === "RIDER" ? "chat" : "driver");
    } catch {
      setError("Could not reach the server");
    }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:8080/api/driver/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profile, email: userEmail }),
      });
      if (res.ok) {
        setProfileSaved(true);
      } else {
        setError("Failed to save profile. Please try again.");
      }
    } catch {
      setError("Could not reach the server");
    }
  };

  const addLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCity.trim()) return;
    const res = await fetch("http://localhost:8080/api/driver/location", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city: newCity, email: userEmail }),
    });
    if (res.ok) {
      setLocations(prev => [...prev, { id: Date.now(), city: newCity }]);
      setNewCity("");
    }
  };

  const removeLocation = async (id: number) => {
    await fetch(`http://localhost:8080/api/driver/location/${id}`, { method: "DELETE" });
    setLocations(prev => prev.filter(l => l.id !== id));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      if (!response.ok) {
        setError("Invalid email or password");
        return;
      }
      const data = await response.json();
      setUserEmail(data.email);
      setView(data.role === "RIDER" ? "chat" : "driver");
    } catch {
      setError("Could not reach the server");
    }
  };

  const toggleAvailable = async () => {
    const res = await fetch("http://localhost:8080/api/driver/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail }),
    });
    const data = await res.json();
    setAvailable(data.available === "true");
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, can't reach the server right now." }]);
    } finally {
      setLoading(false);
    }
  };

  if (view === "landing") {
    return (
      <div className="app centered">
        <header className="header">
          <h1>DriveMe</h1>
          <p>Your AI-powered ride assistant</p>
        </header>
        <div className="role-select">
          <button className="role-btn rider" onClick={() => handleRoleSelect("RIDER")}>
            <span className="role-icon">🚗</span>
            <span className="role-label">Looking for a ride</span>
            <span className="role-sub">Book a ride instantly</span>
          </button>
          <button className="role-btn driver" onClick={() => handleRoleSelect("DRIVER")}>
            <span className="role-icon">🧑‍✈️</span>
            <span className="role-label">Work as a driver</span>
            <span className="role-sub">Set your own hours</span>
          </button>
        </div>
      </div>
    );
  }

  if (view === "auth") {
    return (
      <div className="app centered">
        <header className="header">
          <h1>DriveMe</h1>
          <p>{selectedRole === "RIDER" ? "Looking for a ride" : "Work as a driver"}</p>
        </header>
        <div className="role-select">
          <button className="role-btn rider" onClick={() => { setForm({ name: "", email: "", password: "" }); setError(""); setView("register"); }}>
            <span className="role-icon">✨</span>
            <span className="role-label">Create an account</span>
            <span className="role-sub">New to DriveMe</span>
          </button>
          <button className="role-btn driver" onClick={() => { setForm({ name: "", email: "", password: "" }); setError(""); setView("login"); }}>
            <span className="role-icon">👤</span>
            <span className="role-label">Log in</span>
            <span className="role-sub">I already have an account</span>
          </button>
          <p className="login-link" onClick={() => setView("landing")}>← Back</p>
        </div>
      </div>
    );
  }

  if (view === "login") {
    return (
      <div className="app centered">
        <header className="header">
          <h1>DriveMe</h1>
          <p>Welcome back</p>
        </header>
        <form className="register-form" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit">Log In</button>
          <button type="button" className="back-btn" onClick={() => setView("auth")}>← Back</button>
        </form>
      </div>
    );
  }

  if (view === "register") {
    return (
      <div className="app centered">
        <header className="header">
          <h1>DriveMe</h1>
          <p>{selectedRole === "RIDER" ? "Create a rider account" : "Create a driver account"}</p>
        </header>
        <form className="register-form" onSubmit={handleRegister}>
          <input
            placeholder="Full name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit">Create Account</button>
          <button type="button" className="back-btn" onClick={() => setView("auth")}>← Back</button>
        </form>
      </div>
    );
  }

  if (view === "driver") {
    return (
      <div className="app driver-app">
        <header className="header">
          <h1>DriveMe</h1>
          <p>Driver Dashboard</p>
          <button className="back-btn signout" onClick={() => { setView("landing"); setUserEmail(""); setAvailable(false); setProfileSaved(false); }}>← Sign out</button>
        </header>

        <div className="dashboard">
          <div className="availability-row">
            <span>Status:</span>
            <button className={`toggle-btn ${available ? "on" : "off"}`} onClick={toggleAvailable}>
              {available ? "Available" : "Unavailable"}
            </button>
          </div>

          <form className="register-form" onSubmit={saveProfile}>
            <h3 className="section-title">Your Profile</h3>
            <input
              placeholder="Phone number"
              value={profile.phoneNumber}
              onChange={e => setProfile({ ...profile, phoneNumber: e.target.value })}
            />
            <input
              placeholder="Vehicle model (e.g. Toyota Camry 2022)"
              value={profile.vehicleModel}
              onChange={e => setProfile({ ...profile, vehicleModel: e.target.value })}
            />
            <input
              placeholder="Price per mile ($)"
              value={profile.pricePerMile}
              onChange={e => setProfile({ ...profile, pricePerMile: e.target.value })}
            />
            <button type="submit">Save Profile</button>
            {profileSaved && <p className="success">Profile saved!</p>}
          </form>

          <div className="locations-section">
            <h3 className="section-title">Locations You Serve</h3>
            <form className="location-form" onSubmit={addLocation}>
              <input
                placeholder="Add a city (e.g. New Brunswick)"
                value={newCity}
                onChange={e => setNewCity(e.target.value)}
              />
              <button type="submit">Add</button>
            </form>
            <div className="location-tags">
              {locations.map(l => (
                <span key={l.id} className="tag">
                  {l.city}
                  <button onClick={() => removeLocation(l.id)}>×</button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>DriveMe</h1>
        <p>Your AI-powered ride assistant</p>
        <button className="back-btn signout" onClick={() => { setView("landing"); setUserEmail(""); setMessages([{ role: "assistant", content: "Hi! I'm your DriveMe assistant. Where do you need to go?" }]); }}>← Sign out</button>
      </header>
      <div className="chat-window">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <span className="bubble">{msg.content}</span>
          </div>
        ))}
        {loading && (
          <div className="message assistant">
            <span className="bubble">Thinking...</span>
          </div>
        )}
      </div>
      <form className="input-area" onSubmit={sendMessage}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Tell me where you need to go..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>Send</button>
      </form>
    </div>
  );
}

export default App;
