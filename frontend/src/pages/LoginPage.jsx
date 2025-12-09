import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, fetchProfile } from "../api/project.api"; // import API

export default function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // input update
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // submit login
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      // 💡 hit backend API
      const res = await loginUser(form);

      // ✔ save token
      localStorage.setItem("token", res.data.token);

      // ✔ optional: fetch profile & store user
      const profileRes = await fetchProfile();
      localStorage.setItem("user", JSON.stringify(profileRes.data.user));

      // redirect after login
      navigate("/products");
    } 
    catch (err) {
      console.log(err);
      setError(
        err.response?.data?.message || "Invalid credentials! Try again."
      );
    } 
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-blue-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        
        <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">
          Login
        </h2>

        {error && (
          <p className="text-red-500 text-center text-sm mb-3">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg"
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg"
            onChange={handleChange}
            required
          />

          <button
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600 text-sm">
          New here?{" "}
          <Link to="/register" className="text-blue-600 font-medium">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
