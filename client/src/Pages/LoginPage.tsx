import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function LoginPage() {

    const [password, setPassword] = React.useState<string>("");
    const [phone, setPhone] = React.useState<string>("");
    const [errors, setErrors] = React.useState<{
    password?: string;
    phone?: string;
    name?: string;
    second_name?: string;
}>({});
    const navigate = useNavigate()
    const { login } = useAuth();


    const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const res = await fetch(`${import.meta.env.VITE_API_URL}login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                phone,
                password
            })
        });
        const data = await res.json();
        if (res.status == 200) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.name));
            login();
            navigate("/");
        } else {
            setErrors(data);
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setErrors({});
        }, 3000);
        return () => clearTimeout(timer);
    }, [errors]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-violet-200 via-purple-200 to-fuchsia-100">
      <div className="w-full max-w-md bg-white/80 rounded-2xl shadow-2xl p-8 flex flex-col gap-6 border border-violet-100">
        <h1 className="text-3xl font-bold text-center text-violet-600 mb-2 drop-shadow">Вход</h1>
        <form onSubmit={submitHandler} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-violet-700 font-medium">
            Телефон
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-lg border border-violet-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-violet-50 placeholder-violet-300 text-violet-900 transition"
              placeholder="Введите телефон"
            />
            {errors?.phone && <p className="text-xs text-fuchsia-600 mt-1">{errors?.phone}</p>}
          </label>
          <label className="flex flex-col gap-1 text-violet-700 font-medium">
            Пароль
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-violet-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-violet-50 placeholder-violet-300 text-violet-900 transition"
              placeholder="Введите пароль"
            />
            {errors?.password && <p className="text-xs text-fuchsia-600 mt-1">{errors?.password}</p>}
          </label>
          <button
            type="submit"
            className="mt-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white font-bold py-2 rounded-lg shadow-md transition"
          >
            Войти
          </button>
        </form>
        <p className="text-center text-violet-600 mt-2">
          Нет аккаунта?{' '}
          <a href="/register" className="text-fuchsia-600 hover:underline font-semibold">Зарегистрироваться</a>
        </p>
      </div>
    </div>
  )
}

export default LoginPage