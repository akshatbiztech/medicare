import { BASE_URL } from "./../../config";
import { useState, useEffect, useContext } from "react";
import DoctorCard from "./../../components/Doctors/DoctorCard";
// import useFetchData from "./../../hooks/useFetchData";
import HashLoader from "react-spinners/HashLoader";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import Appointments from "../Doctor-Account/Appointments";

const MyBookings = () => {
  // const {
  //   data: myAppointments,
  //   loading,
  //   error,
  // } = useFetchData(`${BASE_URL}/users/appointments/my-appointments`);
  const { user } = useContext(AuthContext);

  const [userAppointments, setUserAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { PROD_URL } = useContext(AuthContext);

  const fetchUserAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${PROD_URL}/booking`, {
        data: {
          action: "getAllAppointments",
        },
      });

      if (response.data.statusCode === 200) {
        const { appointments } = response.data.body;

        setUserAppointments(
          appointments.filter(
            (appointment) => appointment.user_email === user.email
          )
        );
        console.log(`Doctor Appointments: ${JSON.stringify(userAppointments)}`);

        setLoading(false);
        setError(false);
      }
    } catch (error) {
      setLoading(false);
      setError(true);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchUserAppointments();
  }, []);

  return (
    <div>
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
        <div className="grid grid-cols-1  lg:grid-cols-2 gap-5">
          {/* {userAppointments?.map((appointment) => (
            <DoctorCard doctor={appointment.doctor_email} key={appointment.booking_id} />
          ))} */}
          <Appointments appointments={userAppointments} />
        </div>
      )}
    </div>
  );
};

export default MyBookings;
