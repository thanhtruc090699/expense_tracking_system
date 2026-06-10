import "../styles/DashboardPage.css";

const transactions = [
  {
    id: 1,
    icon: "🛒",
    title: "Kaufland",
    category: "Groceries",
    date: "Today",
    amount: "-€67.45",
  },
  {
    id: 2,
    icon: "☕",
    title: "Starbucks",
    category: "Restaurant",
    date: "Today",
    amount: "-€12.50",
  },
  {
    id: 3,
    icon: "🚌",
    title: "Bus Ticket",
    category: "Transport",
    date: "Yesterday",
    amount: "-€3.20",
  },
];

const chartItems = [
  {
    name: "Food",
    amount: "€1,150",
    percent: "40%",
    className: "red",
  },
  {
    name: "Transport",
    amount: "€680",
    percent: "24%",
    className: "blue",
  },
  {
    name: "Bills",
    amount: "€520",
    percent: "18%",
    className: "green",
  },
  {
    name: "Shopping",
    amount: "€350",
    percent: "12%",
    className: "yellow",
  },
  {
    name: "Others",
    amount: "€147",
    percent: "6%",
    className: "gray",
  },
];

export function DashboardPage() {
  return (
    <main className="dashboard-page">
      <section className="dashboard-header">
        <h1>Welcome Back!</h1>

        <div className="profile-image">
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop"
            alt="Profile"
          />
        </div>
      </section>

      <section className="stats-scroll">
        <article className="stat-card large">
          <h2>Total Spend This Month</h2>
          <strong>€4,678</strong>
          <p className="red-text">+10% vs last month</p>
        </article>

        <article className="stat-card small">
          <h2>Transactions</h2>
          <strong>15</strong>
          <p>+33% vs last month</p>
        </article>
      </section>

      <section className="category-card">
        <div className="category-card-header">
          <h2>Spending by Category</h2>
          <span>April 2026</span>
        </div>

        <div className="chart-layout">
          <div className="donut-chart">
            <div className="donut-hole" />
          </div>

          <div className="chart-legend">
            {chartItems.map((item) => (
              <div className="legend-item" key={item.name}>
                <div className="legend-name-row">
                  <span className={`legend-dot ${item.className}`} />
                  <span className="legend-name">{item.name}</span>
                </div>

                <div className="legend-money">
                  <strong>{item.amount}</strong>
                  <p>{item.percent}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="recent-section">
        <div className="recent-header">
          <h2>Recent Transactions</h2>
          <button type="button">View All</button>
        </div>

        <div className="transaction-list">
          {transactions.map((transaction) => (
            <article className="transaction-card" key={transaction.id}>
              <div className="transaction-left">
                <div className="transaction-icon">{transaction.icon}</div>

                <div>
                  <h3>{transaction.title}</h3>

                  <div className="transaction-meta">
                    <span>{transaction.category}</span>
                    <p>{transaction.date}</p>
                  </div>
                </div>
              </div>

              <strong>{transaction.amount}</strong>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}