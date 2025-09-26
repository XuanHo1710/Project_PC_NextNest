// import { Image, Tooltip } from "antd";
import useCartStore from "@/hooks/useCart";
import { IProductCard } from "@/types/model.client.d";
import { Image } from "antd";
import Link from "next/link";
import Swal from "sweetalert2";

const CardProduct = ({ product, css }: { product: IProductCard, css: string }) => {

    const { addToCart } = useCartStore();

    // const tooltipStyle = {
    //     // position: "fixed",
    //     // top: `${position.y - 35}px`,
    //     // left: `${position.x + 10}px`,
    //     // pointerEvents: "none", 
    //     // maxWidth: "max-content",
    //     width: "410px",
    //     zIndex: 1000,
    // };

    return (
        <>
            <div className={'card rounded-lg flex flex-col max-h-max bg-white dark:bg-gray-900 p-2 dark:text-white ' + css} >
                {/* <Tooltip
                    title={<DetailTooltip data={prop?.data} />}
                    color="blue"
                    placement="rightTop"
                    className="pointer-events-none lg:pointer-events-auto"
                    overlayInnerStyle={tooltipStyle} // Custom style cho Tooltip
                >
                </Tooltip> */}
                <div className='card-img hover:-translate-y-2 transition-all'>
                    <Image
                        src={product.images[0]}
                        className="w-250 h-200"
                        alt="#"
                    />
                </div>
                <div className='card-content mb-3 text-center'>
                    <Link href={`/product/${product._id}`}>
                        <h2 className='font-medium cursor-pointer min-h-12 hover:text-blue-500 text-sm lg:text-base line-clamp-2'>
                            {product.name}
                        </h2>
                    </Link>
                    <h2 className='font-bold cursor-default text-xl my-1 text-blue-400'>
                        {(product.newPrice).toLocaleString()} đ
                    </h2>
                    <div className='font-medium cursor-default text-xs my-1 '>
                        <span className='line-through text-slate-400 mr-2'>{product.oldPrice.toLocaleString()} đ</span>
                        <span className='block lg:inline-block text-red-500'>(Tiết kiệm {(product.discount).toFixed(0)}%)</span>
                    </div>

                </div>
                <div className='card-footer flex items-center justify-between mt-auto'>
                    <div className='status text-xs md:text-base cursor-default'>
                        <div className='flex items-center text-green-600'>
                            <i className="fa-regular fa-circle-check mr-2"></i>
                            <p>Còn hàng</p>
                        </div>
                        <div className='flex items-center'>
                            <i className="fa-solid fa-gift mr-2"></i>
                            <p>Quà tặng</p>
                        </div>
                    </div>
                    <div onClick={() => {
                        Swal.fire({
                            icon: "success",
                            title: "Thêm sản phẩm vào giỏ hàng thành công!",
                            showConfirmButton: false,
                            timer: 2000,
                            background: "#fff",
                            color: "#000",        // màu chữ
                            iconColor: "#52c41a",
                            customClass: {
                                title: "!text-2xl", // chữ nhỏ hơn (Tailwind)
                            },
                        });

                        addToCart(product);

                    }} className='hover:bg-blue-500 transition-all text-base max-h-max py-2.5 bg-blue-400 rounded-2xl cart-icon flex items-center px-3 xl:px-5 cursor-pointer text-white'>
                        <i className="fa-solid fa-cart-shopping"></i>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CardProduct;