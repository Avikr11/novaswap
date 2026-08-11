import { motion } from "framer-motion";

interface SwapDirectionButtonProps {
  onClick: () => void;
}

function SwapDirectionButton({
  onClick,
}: SwapDirectionButtonProps) {
  return (
    <div className="my-4 flex justify-center">
      <motion.button
        type="button"
        onClick={onClick}
        whileHover={{
          rotate: 180,
          scale: 1.08,
        }}
        whileTap={{
          scale: 0.9,
          rotate: 180,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 18,
        }}
        className="
          rounded-full
          border
          border-slate-700
          bg-slate-900
          p-3
          text-white
          shadow-lg
          shadow-black/20
          hover:border-cyan-400
          hover:bg-slate-800
        "
        aria-label="Swap token direction"
      >
        ⇅
      </motion.button>
    </div>
  );
}

export default SwapDirectionButton;