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
    <div>
        <h1>Вход</h1>
        <form onSubmit={submitHandler}>
            <label>
                phone
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            {errors?.phone && <p style={{ color: 'red' }}>{errors?.phone}</p>}
            </label>
            <label>
                password
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            {errors?.password && <p style={{ color: 'red' }}>{errors?.password}</p>}
            <button type='submit'>Login</button>
        </form>
        <p>Нет аккаунта? <a href="/register">Зарегистрироваться</a></p>
    </div>
  )
}

export default LoginPage