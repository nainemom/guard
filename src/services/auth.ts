import { CryptographyPairKeys } from "@/services/cryptography";
import { useStorage } from "@/utils/storage";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const storageKey = 'guard-auth';

export const useAuth = () => {
  return useStorage<CryptographyPairKeys | null>(storageKey, null);
};

export const needAuth = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!auth?.private_key) {
      navigate('/setup');
    }
  }, [auth]);
}
