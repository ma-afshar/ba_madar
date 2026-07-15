export default function Header() {
  return (
    <header className="w-93.75 h-18 mx-auto bg-white border-b-2 border-[#DDDCDB] flex items-center">
      <div className="w-82 h-10 mx-auto flex items-center justify-between">
        <div className="w-10 h-10 border border-[#C0C0C0] rounded-xl flex items-center">
          <img
            src="/images/header/basket.png"
            alt="basket"
            width={16}
            height={16}
            className="w-4 h-4 mx-auto"
          />
        </div>
        <div className="w-23 h-8 flex items-center justify-center">
          <div className="w-15 h-8">
            <img
              src="/images/header/logo.png"
              alt="logo"
              width={60}
              height={32}
              className="w-14.5 h-7.5"
            />
          </div>
          <div className="w-8 h-8">
            <img
              src="/images/header/direction.png"
              alt="logo"
              width={32}
              height={32}
              className="w-7.5 h-7.5"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
