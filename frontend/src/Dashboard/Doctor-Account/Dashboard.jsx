import { useState, useContext, useEffect } from "react";
// import doctorImg from "../../assets/images/doctor-img02.png";
import starIcon from "../../assets/images/Star.png";
import DoctorAbout from "../../pages/Doctors/DoctorAbout";
import useGetProfile from "../../hooks/useFetchData";
import { BASE_URL } from "../../config";
import Profile from "./Profile";
import Tabs from "./Tabs";
import HashLoader from "react-spinners/HashLoader";
import Appointments from "./Appointments";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";

const Dashboard = () => {
  const [tab, setTab] = useState("overview");
  // const {
  //   data: doctorData,
  //   loading,
  //   error,
  // } = useGetProfile(`${BASE_URL}/doctors/profile/me`);
  const { PROD_URL } = useContext(AuthContext);
  const [doctorData, setDoctorData] = useState({});
  const [doctorAppointments, setDoctorAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { user, token, role } = useContext(AuthContext);

  const fetchDoctorDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${PROD_URL}/doctor`, {
        data: {
          action: "getSingleDoctor",
          id: user.email,
        },
      });

      if (response.data.statusCode === 200) {
        const { doctor } = response.data.body;

        setDoctorData(doctor);
        setLoading(false);
        setError(false);
      }
    } catch (error) {
      setLoading(false);
      setError(true);
      toast.error(error.message);
    }
  };

  const fetchDoctorAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${PROD_URL}/booking`, {
        data: {
          action: "getAllAppointments",
        },
      });

      if (response.data.statusCode === 200) {
        const { appointments } = response.data.body;

        setDoctorAppointments(
          appointments.filter(
            (appointment) => appointment.doctor_email === user.email
          )
        );
        console.log(`Doctor Appointments: ${doctorAppointments}`);

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
    fetchDoctorDetails();
    fetchDoctorAppointments();
  }, []);

  return (
    <section>
      <div className="max-w-[1170px] px-5 mx-auto">
        {loading && (
          <div className="flex items-center justify-center w-full h-full">
            <HashLoader color="#0067FF" />
          </div>
        )}
        {error && (
          <div>
            <h3>{error.message}</h3>
          </div>
        )}

        {!loading && !error && (
          <div className="grid lg:grid-cols-3 gap-[30px] lg:gap-[50px] ">
            <Tabs tab={tab} setTab={setTab} />
            <div className="lg:col-span-2">
              {doctorData.isApproved === "pending" && (
                <div
                  id="alert-4"
                  className="flex p-4 mb-4 text-yellow-800 rounded-lg bg-yellow-50 "
                  role="alert"
                >
                  <svg
                    aria-hidden="true"
                    className="flex-shrink-0 w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span className="sr-only">Info</span>
                  <div className="ml-3 text-sm font-medium">
                    To get approval please complete your profile. We&apos;ll
                    review manually and approve within 3days.
                  </div>
                </div>
              )}
              <div className="mt-8">
                {tab === "overview" && (
                  <div>
                    <div className="flex gap-5 items-center mb-10">
                      <figure className="max-w-[200px] max-h-[200px]">
                        <img src={doctorData.photo} alt="" className="w-full" />
                      </figure>
                      <div>
                        <span className="bg-[#CCF0F3] text-irisBlueColor py-1 px-4 lg:py-2 lg:px-6 rounded text-[12px] leading-4 lg:text-[16px] lg:leading-7 font-[600]">
                          {doctorData.specialization}
                        </span>
                        <h3 className="text-headingColor text-[22px] leading-[36px] mt-3 font-bold">
                          {doctorData.name}
                        </h3>
                        {/* <div className="flex items-center gap-[6px]">
                          <span className="flex items-center gap-[6px] text-[14px] leading-6 lg:text-[16px] lg:leading-7 font-[600] text-headingColor">
                            <img src={starIcon} alt="" />{" "}
                            {doctorData.averageRating}
                          </span>
                          <span className="text-[14px] leading-6 lg:text-[16px] lg:leading-7 font-[400] text-textColor">
                            ({doctorData.totalRating})
                          </span>
                        </div> */}
                        <p className="text__para text-[15px] leading-6 lg:max-w-[390px]">
                          {doctorData.bio}
                        </p>
                      </div>
                    </div>
                    <DoctorAbout
                      name={doctorData.name}
                      about={doctorData.about}
                      qualifications={doctorData.qualifications}
                      experiences={doctorData.experiences}
                    />
                  </div>
                )}
                {tab === "settings" && <Profile doctorData={doctorData} />}
                {tab === "appointments" && (
                  <Appointments appointments={doctorAppointments} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
