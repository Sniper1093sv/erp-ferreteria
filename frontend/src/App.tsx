export default function App() {
  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900">
      <h1 className="text-4xl font-bold text-white mb-4">¿Tailwind funciona?</h1>
      <p className="text-lg text-slate-200 mb-6">
        Si ves esto centrado y con colores bonitos, Tailwind está listo.
      </p>
      <button className="px-8 py-2 bg-indigo-500 text-white font-bold rounded-lg shadow-md hover:bg-indigo-600 transition">
        ¡Sí funciona!
      </button>
    </div>
  );
}
