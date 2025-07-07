import { signInWithPopup } from "firebase/auth";
import { auth, provider, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Kontrollera om användaren finns i Firestore
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          role: "user",
          name: user.displayName,
        });
      }
      navigate("/");
    } catch (err) {
      console.error("Fel vid inloggning:", err.message);
      alert("Inloggning misslyckades: " + err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Välkommen</h2>
        <p>Logga in med ditt Google-konto för att fortsätta.</p>
        <button onClick={signInWithGoogle} className="login-button">
          Logga in med Google
        </button>
      </div>
    </div>
  );
}

export default Login;
