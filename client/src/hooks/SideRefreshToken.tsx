'use client'
import useAuthEmployee from "@/hooks/AuthEmployeeContext";
import { IAccountEmployee } from "@/stores/accountEmployeeStore";
import axios from "axios";
// import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

export default function SlideRefreshToken() {
    const { accountLogin, setAccountLogin, accessToken } = useAuthEmployee();
    const [expireAccessToken, setExpireAccessToken] = useState<number>(0);
    const expireAccessRef = useRef<number>(0);
    useEffect(() => {
        const fetchGetExpire = async () => {
            const res = await axios.get("/api/admin/auth/token/decode");
            console.log(res.data);

            expireAccessRef.current = res.data.exp * 1000
            setExpireAccessToken(res.data.exp * 1000 || 0);
        }
        fetchGetExpire();
    }, [])

    useEffect(() => {
        if (!accountLogin?.refreshToken) return;
        if (!expireAccessToken) return; // Chưa lấy xong exp thì không chạy

        // Mốc hết hạn: 1 phút kể từ khi component chạy
        const expireTime = Date.now() + accountLogin.expireToken;
        // Mốc hết hạn access token
        expireAccessRef.current = expireAccessToken;

        const interval = setInterval(async () => {
            const now = Date.now();
            let refreshLeft = Math.floor((expireTime - now) / 1000);
            const accessLeft = Math.floor((expireAccessRef.current - now) / 1000);


            console.log(`[AuthEmployee] Còn ${refreshLeft}s`);
            console.log("Token: ", accountLogin?.refreshToken);
            console.log("AccessToken left: ", accessLeft, " s");


            // dưới 20s thì refresh token =)))
            if (refreshLeft <= 20 && accessLeft > 0) {
                console.log(`[AuthEmployee] Refresh Token còn ${refreshLeft}s ➔ Gọi /auth/refresh...`);

                axios.get(
                    "http://localhost:8080/api/v1/admin/auth/refresh-token",
                    {
                        withCredentials: true,
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    }
                )
                    .then(async (res) => {
                        const { refresh_token } = res.data;

                        // Cập nhật access_token
                        console.log("[AuthEmployee] ✅ Refresh thành công:", refresh_token);
                        const resAccount = await axios.post('/api/admin/auth/token', {});

                        setAccountLogin(resAccount.data as IAccountEmployee);
                        // 👇 Cập nhật lại `refreshLeft`
                        refreshLeft = Math.floor((expireTime - Date.now()) / 1000);
                    })
                    .catch(() => {
                        toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
                        setAccountLogin(null);
                    });
            }

            if (accessLeft < 0) {
                toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
                console.log("Hết hạn access token...............");
                sessionStorage.removeItem("token");
                setAccountLogin(null);
                refreshLeft = 0;
            }
        }, 10_000); // Kiểm tra mỗi 10s

        return () => clearInterval(interval);
    }, [accountLogin, expireAccessToken]);


    return null;
}