import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

function RegPage() {

    const [password, setPassword] = React.useState<string>("");
    const [confirmPassword, setConfirmPassword] = React.useState<string>("");
    const [name, setName] = React.useState<string>("");
    const [secondName, setSecondName] = React.useState<string>("");
    const [phone, setPhone] = React.useState<string>("");
    const [errors, setErrors] = React.useState<{
  password?: string;
  phone?: string;
  name?: string;
  second_name?: string;
}>({});
    const navigate = useNavigate()


    const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setErrors({ password: "Passwords do not match" });
            return;
        }
        const res = await fetch(`${import.meta.env.VITE_API_URL}register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                second_name: secondName,
                phone,
                password
            })
        });
        const data = await res.json();
        if (res.status == 201) {
            navigate("/login");
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
        <h1>Регистрация</h1>
        <form onSubmit={submitHandler}>
            <label>
                name
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            {errors?.name && <p style={{ color: 'red' }}>{errors?.name}</p>}
            </label>
            <label>
                second name
                <input type="text" value={secondName} onChange={(e) => setSecondName(e.target.value)} />
            {errors?.second_name && <p style={{ color: 'red' }}>{errors?.second_name}</p>}
            </label>
            <label>
                phone
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            {errors?.phone && <p style={{ color: 'red' }}>{errors?.phone}</p>}
            </label>
            <label>
                password
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <label>
                confirm password
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </label>
            {errors?.password && <p style={{ color: 'red' }}>{errors?.password}</p>}
            <button type='submit'>Register</button>
        </form>
        <p>Уже есть аккаунт? <a href="/login">Войти</a></p>
    </div>
  )
}

export default RegPage