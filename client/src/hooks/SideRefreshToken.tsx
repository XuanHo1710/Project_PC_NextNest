'use client'
import useAuthEmployee from "@/hooks/AuthEmployeeContext";
import { IAccountEmployee } from "@/stores/accountEmployeeStore";
import axios from "axios";
// import { useRouter } from "next/router";
import { useEffect } from "react";
import { toast } from "react-toastify";

export default function SlideRefreshToken() {
    const { accountLogin, setAccountLogin, accessToken } = useAuthEmployee();
    useEffect(() => {
        // if (!accountLogin?.refresh_token) return;

        // Mốc hết hạn: 1 phút kể từ khi component chạy
        const expireTime = Date.now() + 30_000;

        const interval = setInterval(() => {
            const now = Date.now();
            let refreshLeft = Math.floor((expireTime - now) / 1000);

            console.log(`[AuthEmployee] Còn ${refreshLeft}s`);
            console.log("Token: ", accountLogin?.refreshToken);


            if (refreshLeft <= 0) {
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
                        const resAccount = await axios.post("http://localhost:8080/api/v1/admin/account-employee/token-account", { token: refresh_token });

                        setAccountLogin(resAccount.data as IAccountEmployee);
                        // 👇 Cập nhật lại `refreshLeft`
                        refreshLeft = Math.floor((expireTime - Date.now()) / 1000);
                    })
                    .catch((error) => {
                        console.error("[AuthEmployee] Refresh thất bại:", error);
                        toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
                        setAccountLogin(null);
                    });
            }
        }, 10_000); // Kiểm tra mỗi 10s

        return () => clearInterval(interval);
    }, [accountLogin]);


    return null;
}