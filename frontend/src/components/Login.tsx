export default function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-[#c33764] to-[#1d2671]">
      <div className="w-full max-w-3xl bg-[#222c36] rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden">
        {/* Login */}
        <div className="flex-1 p-8 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-pink-200 mb-2">Member Login</h2>
          <p className="text-gray-400 mb-8">Please fill in your basic info</p>
          <input
            className="w-full p-3 mb-4 rounded bg-[#1b232c] text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400"
            type="text"
            placeholder="Username"
          />
          <input
            className="w-full p-3 mb-4 rounded bg-[#1b232c] text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400"
            type="password"
            placeholder="Password"
          />
          <button className="w-full py-3 rounded bg-gradient-to-r from-[#d9afd9] to-[#97d9e1] text-[#222c36] font-bold shadow mt-2 hover:from-[#97d9e1] hover:to-[#d9afd9] transition">
            LOGIN
          </button>
          <span className="block mt-4 text-xs text-gray-400 text-right cursor-pointer hover:underline">
            Forgot Password?
          </span>
        </div>
        {/* Sign Up */}
        <div className="flex-1 min-w-[300px] relative flex items-center justify-center p-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=500&q=80')" }}>
          <div className="absolute inset-0 bg-black opacity-40"></div>
          <div className="relative z-10 flex flex-col justify-center items-center h-full p-8">
            <h2 className="text-3xl font-bold text-pink-200 mb-2">Sign Up</h2>
            <p className="text-gray-200 mb-8">Using your social media account</p>
            <div className="flex gap-4 mb-4">
              <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
                <span className="text-pink-300 text-xl">@</span>
              </button>
              <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
                <span className="text-blue-400 text-xl">f</span>
              </button>
              <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
                <span className="text-blue-300 text-xl">t</span>
              </button>
            </div>
            <label className="flex items-center gap-2 text-xs text-gray-300">
              <input type="checkbox" className="accent-pink-400" /> By signing up I agree with terms and conditions
            </label>
            <span className="block mt-4 text-xs text-gray-200 cursor-pointer hover:underline">
              Create account
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
