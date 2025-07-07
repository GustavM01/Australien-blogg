import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./useAuth";

export function useUserRole() {
  const [role, setRole] = useState(null);
  const user = useAuth();

  useEffect(() => {
    const fetchRole = async () => {
      if (user) {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setRole(snap.data().role);
        } else {
          setRole("user"); // fallback om ingen roll finns
        }
      } else {
        setRole(null); // inte inloggad
      }
    };

    fetchRole();
  }, [user]);

  return role;
}
