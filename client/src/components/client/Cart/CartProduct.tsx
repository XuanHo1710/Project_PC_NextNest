import { ICartItem } from "@/types/order";
import { IProductCard } from "@/types/product";
import {
    getProductDisplayPrice,
    getProductOriginalPrice,
    getProductImage,
} from "@/utils/productHelpers";
import { Button, Image } from "antd"
import Link from "next/link";


interface CartProductProps {
    cartItem: ICartItem;
    handle: {
        removeFromCart: (id: string) => void;
        updateQuantity: (product: IProductCard, qty: number) => void;
        // Add other handler functions if needed
    };
}

const CartProduct = ({ cartItem, handle }: CartProductProps) => {
    return (
        <>
            {cartItem &&
                <div className='cart-product-item flex gap-3 p-3 border-solid border-2 dark:bg-gray-800 dark:border-stone-800 border-stone-100'>
                    <div className='basis-1/6'>
                        <Image alt="Product" width={100} src={getProductImage(cartItem.product)} />
                    </div>
                    <div className='basis-5/6'>
                        <div className='flex items-center pb-3 justify-between'>
                            <Link href={`/product/${cartItem.product.slug}`}>
                                <h2 className='hover:text-blue-500 dark:text-white cursor-pointer text-sm md:text-base line-clamp-1'>
                                    <span className='font-bold text-red-500'>[DEAL] </span>
                                    {cartItem.product.name}
                                </h2>
                            </Link>
                            <i onClick={() => handle.removeFromCart(cartItem.product._id)} className="hover:text-red-600 dark:text-purple-500 text-lg cursor-pointer fa-regular fa-trash-can"></i>
                        </div>
                        <div className='flex items-center justify-between mt-2'>
                            <div className='text-stone-500'>
                                <p className='font-bold text-xs md:text-lg line-through'>{getProductOriginalPrice(cartItem.product).toLocaleString()} đ</p>
                                <p className='font-bold text-xs md:text-xl text-blue-500'>{getProductDisplayPrice(cartItem.product).toLocaleString()} đ</p>
                            </div>
                            <div className='text-stone-600 flex flex-col items-end'>
                                <div className='flex items-center text-sm md:text-xl'>
                                    <Button onClick={() => handle.updateQuantity(cartItem.product, -1)} className='rounded-none px-1 md:px-3 dark:bg-black dark:text-white dark:border-slate-700'>
                                        <i className="fa-solid fa-minus"></i>
                                    </Button>
                                    <input type='text' className='dark:bg-black bg-stone-100 dark:text-white w-5 md:w-14 text-center h-8 border-solid' disabled value={cartItem.quantity} />
                                    <Button onClick={() => handle.updateQuantity(cartItem.product, 1)} className='rounded-none px-1 md:px-3 dark:bg-black dark:text-white dark:border-slate-700'>
                                        <i className="fa-solid fa-plus"></i>
                                    </Button>
                                </div>
                                <div className='total-price mt-1'>
                                    <p className='dark:text-slate-400 font-semibold block md:inline-block text-xs md:text-lg'>Thành tiền:</p>
                                    <p className='text-red-500 block md:inline-block font-bold text-xs md:text-xl'> {(cartItem.subtotal).toLocaleString()} đ</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}

export default CartProduct