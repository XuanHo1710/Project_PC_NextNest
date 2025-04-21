import '@ant-design/v5-patch-for-react-19';
import { Button } from "antd";

export default function Header() {
    return (
      <>
          <header className="fixed top-0 left-0 right-0 py-5 px-5 border-b-2 border-slate-100 border-solid">
            <div className="flex justify-between text-center">
                <h3 className="font-bold">ADMIN</h3>
                <div className="flex justify-center" style={{alignItems: "center"}}>
                    {/* <UserOutlined />
                    <h3>Nguyễn Xuân Hồ</h3> */}
                    <Button className="mx-2" type="primary">Đăng nhập</Button>
                    <Button className="mx-2 !text-white !bg-red-500 !outline-red-200">Đăng xuất</Button>
                </div>
            </div>
          </header>
      </>
    );
  }
  