import { CryptographyPairKeys } from "@/services/cryptography";
import { useStorage } from "@/utils/storage";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

export const storageKey = 'guard-auth';

export const useAuth = () => {
  return useStorage<CryptographyPairKeys | null>(storageKey, null);
};

export const useEncryptLink = () => {
  const [auth] = useAuth();
  return auth?.public_key && `/encrypt/${encodeURIComponent(auth.public_key)}`;
}

export const needAuth = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!auth?.private_key) {
      navigate('/setup');
    }
  }, [auth]);
}
