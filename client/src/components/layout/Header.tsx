import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";

export default function Header() {
  const navigate = useNavigate();
  const { totalQuantity } = useCart();

  return (
    <header className="site-header w-93.75 h-[62px] mx-auto bg-white border-b border-[#E6E6E6] flex items-center">
      <div className="w-82 h-10 mx-auto flex items-center justify-between">
        <button
          type="button"
          aria-label="سبد خرید"
          onClick={() => navigate("/basket")}
          className="relative w-[35px] h-[35px] border border-[#C0C0C0] rounded-[10px] flex items-center bg-white cursor-pointer"
        >
          <img
            src="/images/header/basket.png"
            alt="basket"
            width={16}
            height={16}
            className="w-4 h-4 mx-auto"
          />
          {totalQuantity > 0 && (
            <span className="absolute -top-[5px] -left-[5px] grid min-w-[17px] h-[17px] box-border place-items-center rounded-full border-2 border-white bg-[#D90A28] px-[3px] text-[8px] leading-none text-white">
              {totalQuantity.toLocaleString("fa-IR")}
            </span>
          )}
        </button>
        <div className="w-15 h-8 flex items-center justify-center">
          <div className="w-15 h-8">
            <img
              src="/images/header/logo.png"
              alt="logo"
              width={60}
              height={32}
              className="w-14.5 h-7.5"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
