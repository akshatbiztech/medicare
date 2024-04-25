/* eslint-disable react/prop-types */

import { useContext } from "react";
import convertTime from "../../utils/convertTime";
import { BASE_URL, token } from "./../../config";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";

const SidePanel = ({ ticketPrice, timeSlots, doctorId }) => {
  const { user, PROD_URL } = useContext(AuthContext);
  // const bookingHandler = async () => {
  //   try {
  //     const response = await fetch(
  //       `${BASE_URL}/bookings/checkout-session/${doctorId}`,
  //       {
  //         method: "post",
  //         headers: {
  //           Authorization: `Bearer ${token} `,
  //         },
  //       }
  //     );

  //     const data = await response.json();

  //     if (data.session.url) {
  //       window.location.href = data.session.url;
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const bookingHandler = async () => {
    try {
      console.log(`Booking Appointments for doctor with id: ${doctorId}`);
      const booking_time = `${timeSlots[0].startingTime}-${timeSlots[0].endingTime}`;
      const response = await axios.post(`${PROD_URL}/booking`, {
        data: {
          action: "getCheckoutSession",
          booking: {
            doctor_email: doctorId,
            user_email: user.email,
            time: booking_time,
          },
        },
      });

      if (response.data.statusCode === 200) {
        toast.success("Appointment booked.");
      }

      if (response.data.statusCode === 400) {
        toast.error("Failed to book appointment");
      }

      if (response.data.statusCode === 500) {
        toast.error("Failed to book appointment");
      }
    } catch (error) {
      toast.error("Failed to book appointment");
    }
  };

  return (
    <div className=" shadow-panelShadow p-3 lg:p-5 rounded-md">
      <div className="flex items-center justify-between">
        <p className="text__para mt-0 font-semibold">Ticket Price</p>
        <span className="text-[16px] leading-7 lg:text-[22px] lg:leading-8 text-headingColor font-bold">
          {ticketPrice} BDT
        </span>
      </div>

      <div className="mt-[30px]">
        <p className="text__para mt-0 font-semibold text-headingColor">
          Available Time Slots:
        </p>
        <ul className="mt-3">
          {timeSlots?.map((item, index) => (
            <li key={index} className="flex items-center justify-between mb-2">
              <p className="text-[15px] leading-6 text-textColor font-semibold">
                {item.day.charAt(0).toUpperCase() + item.day.slice(1)}:
              </p>
              <p className="text-[15px] leading-6 text-textColor font-semibold">
                {convertTime(item.startingTime)}
                <span> - </span>
                {convertTime(item.endingTime)}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <button onClick={bookingHandler} className="px-2 btn w-full rounded-md">
        Book Appointment
      </button>
    </div>
  );
};

export default SidePanel;
