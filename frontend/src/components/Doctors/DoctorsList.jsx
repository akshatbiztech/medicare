import DoctorCard from "./DoctorCard.jsx";
// import { doctors } from "../../assets/data/doctors";
import { BASE_URL } from "../../config.js";
// import useFetchData from "../../hooks/useFetchData.js";
import HashLoader from "react-spinners/HashLoader.js";
import { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext.jsx";

const DoctorsList = () => {
  // const { data: doctors, loading, error } = useFetchData(`${BASE_URL}/doctor`);
  const { PROD_URL } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [doctors, setDoctors] = useState([]);

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

  return (
    <>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 lg:gap-[30px] mt-[30px] lg:mt-[55px]">
          {doctors?.map((doctor) => (
            <DoctorCard doctor={doctor} key={doctor.id} />
          ))}
        </div>
      )}
    </>
  );
};

export default DoctorsList;
