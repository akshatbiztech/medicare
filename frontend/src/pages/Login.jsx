import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import HashLoader from "react-spinners/HashLoader";
import axios from "axios";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "patient",
  });
  const [loading, setLoading] = useState(false);

  const { dispatch, PROD_URL } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await axios.post(`${PROD_URL}/auth`, {
        data: {
          action: "login",
          user: {
            email: formData.email,
            password: formData.password,
            role: formData.role,
          },
        },
      });

      console.log("Result===>", response.data);

      if (response.data.statusCode === 200) {
        const { role, user_id } = response.data.body.data;
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: {
            user: response.data.body.data,
            role: role,
          },
        });

        setLoading(false);
        toast.success("Login Sucessful");
        navigate("/home");
        return;
      }

      if (response.data.statusCode === 400) {
        setLoading(false);
        toast.error("Invalid credentials");
        setTimeout(() => {
          setFormData({
            email: "",
            password: "",
          });
        }, 1000);
        return;
      }
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <section className="px-5 md:px-0">
      <div className=" w-full max-w-[570px] mx-auto rounded-lg shadow-lg md:p-10">
        <div>
          <h3 className="text-headingColor text-[22px] leading-9 font-bold mb-10">
            Hello! <span className="text-[#0067FF]">Welcome</span> Back 🎉
          </h3>
          <form onSubmit={handleSubmit} className="py-4 md:py-0">
            <div className="mb-5">
              <input
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                name="email"
                placeholder="Enter Your Email"
                className="w-full pr-4 py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-[#0067FF] text-[16px] leading-7 text-headingColor placeholder:text-textColor"
                required
              />
            </div>

            <div className="mb-5">
              <input
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                name="password"
                placeholder="Password"
                className="w-full pr-4 py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-[#0067FF] text-[16px] leading-7 text-headingColor placeholder:text-textColor"
                required
              />
            </div>

            <div className="mb-5 flex items-center justify-between">
              <label className="text-headingColor font-bold text-[16px] leading-7">
                Are you a:
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="text-textColor font-semibold text-[15px] leading-7 px-4 py-3 focus:outline-none"
                  required
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </select>
              </label>
            </div>

            <div className="mt-7">
              <button
                type="submit"
                disabled={loading && true}
                className="w-full bg-[#0067FF] text-white py-3 px-4 rounded-lg text-[18px] leading-[30px]"
              >
                {loading ? <HashLoader size={25} color="#fff" /> : "Login"}
              </button>
            </div>

            <p className="mt-5 text-textColor text-center">
              Don&apos;t have an account?
              <Link to="/register" className="text-[#0067FF] font-medium ml-1">
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Login;
