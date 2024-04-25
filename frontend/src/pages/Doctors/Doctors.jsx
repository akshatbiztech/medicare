import { useContext, useEffect, useState } from "react";
import DoctorCard from "../../components/Doctors/DoctorCard";
import Testimonial from "../../components/Testimonial/Testimonial";
import { BASE_URL } from "../../config";
import useFetchData from "../../hooks/useFetchData";
import HashLoader from "react-spinners/HashLoader";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";

const Doctors = () => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const { PROD_URL } = useContext(AuthContext);

  const fetchDoctorsList = async () => {
    try {
      const response = await axios.post(`${PROD_URL}/doctor`, {
        data: {
          action: "getAllDoctors",
        },
      });

      if (response.data.statusCode === 200) {
        const { doctors } = response.data.body;

        setDoctors(doctors);
        setLoading(false);
        setError(false);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchDoctorsList();
  }, []);

  const handleSearch = () => {
    setQuery(query.trim());
  };

  useEffect(() => {
    // Debounce the query value after 500ms of inactivity
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(query);
    }, 700);

    // Clean up the timeout
    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <>
      <section className="bg-[#fff9ea]">
        <div className="container text-center">
          <h2 className="heading">Find a Doctor</h2>
          <div className="max-w-[570px] mx-auto mt-[30px] bg-[#0066ff2c] rounded-md flex items-center justify-between ">
            <input
              className="py-4 pl-4 pr-2 focus:outline-none cursor-pointer w-full bg-transparent placeholder:text-textColor"
              type="search"
              placeholder="Search by doctor name or specialization"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              className="btn mt-0 rounded-[0px] rounded-r-md"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          {loading && (
            <div className="flex items-center justify-center w-full h-full">
              <HashLoader color="#0067FF" />
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center w-full h-full">
              <h3 className="text-headingColor text-[20px] font-semibold leading-[30px]">
                {error}
              </h3>
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {doctors?.map((doctor) => (
                <DoctorCard doctor={doctor} key={doctor.doctor_id} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="container">
          <div className="xl:w-[470px] mx-auto">
            <h2 className="heading text-center">What our patient say</h2>
            <p className="text__para text-center">
              World-class care for everyone. Our health System offers unmatched,
              expert health care.
            </p>
          </div>

          <Testimonial />
        </div>
      </section>
    </>
  );
};

export default Doctors;
