import { useNavigate } from "react-router-dom";

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.errorCode}>404</div>

        <h1 style={styles.title}>Seite nicht gefunden</h1>

        <p style={styles.text}>
          Ups! Diese Seite existiert leider nicht oder wurde verschoben.
        </p>

        <button style={styles.button} onClick={() => navigate("/")}>
          Zurück zur Startseite
        </button>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #eaf5e9, #ffffff)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "24px",
  },

  card: {
    width: "100%",
    maxWidth: "420px",
    background: "white",
    borderRadius: "28px",
    padding: "42px 28px",
    textAlign: "center",
    boxShadow: "0 18px 45px rgba(45, 91, 45, 0.18)",
  },

  errorCode: {
    fontSize: "72px",
    fontWeight: 900,
    color: "#2d5b2d",
    marginBottom: "10px",
  },

  title: {
    fontSize: "28px",
    color: "#1f3d1f",
    marginBottom: "12px",
  },

  text: {
    fontSize: "16px",
    color: "#5f6f5f",
    lineHeight: 1.6,
    marginBottom: "28px",
  },

  button: {
    background: "#2d5b2d",
    color: "white",
    border: "none",
    borderRadius: "16px",
    padding: "14px 24px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(45, 91, 45, 0.28)",
  },
};

export default NotFoundPage;