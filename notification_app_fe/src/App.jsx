import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL = "http://20.207.122.201/evaluation-service/notifications";

const typeWeight = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

function sortByPriority(items) {
  return [...items].sort((a, b) => {
    const typeDifference = (typeWeight[b.Type] || 0) - (typeWeight[a.Type] || 0);
    if (typeDifference !== 0) return typeDifference;

    return new Date(b.Timestamp) - new Date(a.Timestamp);
  });
}

async function logMessage(level, packageName, message) {
  try {
    await fetch("http://20.207.122.201/evaluation-service/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        stack: "frontend",
        level,
        package: packageName,
        message,
      }),
    });
  } catch {
    // Logging errors are ignored to keep the UI usable.
  }
}

function App() {
  const [notifications, setNotifications] = useState([]);
  const [selectedType, setSelectedType] = useState("All");
  const [priorityOnly, setPriorityOnly] = useState(false);
  const [viewedIds, setViewedIds] = useState([]);
  const [status, setStatus] = useState("Loading notifications...");

  useEffect(() => {
    async function fetchNotifications() {
      try {
        await logMessage("info", "api", "Started fetching notifications");

        const response = await fetch(`${API_URL}?limit=50&page=1`, {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_ACCESS_TOKEN}`,
          },
        });

        if (!response.ok) {
          throw new Error("Unable to fetch notifications");
        }

        const data = await response.json();
        const list = data.notifications || [];

        setNotifications(list);
        setStatus("");
        await logMessage("info", "api", "Notifications fetched successfully");
      } catch {
        setStatus("Could not load notifications. Please check token or API.");
        await logMessage("error", "api", "Notification fetch failed");
      }
    }

    fetchNotifications();
  }, []);

  const visibleNotifications = useMemo(() => {
    let list = notifications;

    if (selectedType !== "All") {
      list = list.filter((item) => item.Type === selectedType);
    }

    if (priorityOnly) {
      return sortByPriority(list).slice(0, 10);
    }

    return [...list].sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
  }, [notifications, selectedType, priorityOnly]);

  function markAsViewed(id) {
    if (!viewedIds.includes(id)) {
      setViewedIds([...viewedIds, id]);
      logMessage("info", "component", "Marked a notification as viewed");
    }
  }

  return (
    <main className="page">
      <section className="header">
        <div>
          <p className="eyebrow">Campus Notification System</p>
          <h1>Notifications</h1>
          <p className="summary">
            Placement updates are treated as highest priority, followed by results and events.
          </p>
        </div>

        <div className="counter">
          <span>{visibleNotifications.length}</span>
          <small>shown</small>
        </div>
      </section>

      <section className="toolbar">
        {["All", "Placement", "Result", "Event"].map((type) => (
          <button
            key={type}
            className={selectedType === type ? "active" : ""}
            onClick={() => setSelectedType(type)}
          >
            {type}
          </button>
        ))}

        <button
          className={priorityOnly ? "active priority" : "priority"}
          onClick={() => setPriorityOnly(!priorityOnly)}
        >
          Top 10 Priority
        </button>
      </section>

      {status && <p className="status">{status}</p>}

      <section className="list">
        {visibleNotifications.map((item) => {
          const isViewed = viewedIds.includes(item.ID);

          return (
            <article
              className={`notification ${isViewed ? "viewed" : "new"}`}
              key={item.ID}
              onClick={() => markAsViewed(item.ID)}
            >
              <div>
                <span className={`badge ${item.Type.toLowerCase()}`}>{item.Type}</span>
                {!isViewed && <span className="newLabel">New</span>}
              </div>

              <h2>{item.Message}</h2>
              <p>{new Date(item.Timestamp).toLocaleString()}</p>
            </article>
          );
        })}
      </section>
    </main>
  );
}

export default App;
