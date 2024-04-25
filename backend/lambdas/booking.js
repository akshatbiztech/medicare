import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import pkg from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";
const {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  UpdateCommand,
  PutCommand,
} = pkg;
import {
  SNSClient,
  PublishCommand,
  SubscribeCommand,
} from "@aws-sdk/client-sns";

const sns = new SNSClient({});

const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const table = "bookings_table";

function getCurrentTime() {
  // Create a new Date object
  const currentTime = new Date();

  // Extract hours, minutes, and seconds
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();

  // Format the time as HH:MM:SS
  const formattedTime = `${hours}:${minutes}:${seconds}`;

  const hashedTime = crypto
    .createHash("sha256")
    .update(formattedTime)
    .digest("hex");

  return hashedTime;
}

export const handler = async (event) => {
  try {
    const action = event.data.action;
    let response;

    switch (action) {
      case "getCheckoutSession":
        const { doctor_email, user_email, time } = event.data.booking;
        response = await getCheckoutSession(doctor_email, user_email, time);
        break;

      case "getAllAppointments":
        response = await getAllAppointments();
        break;
      default:
        response = {
          statusCode: 405,
          body: JSON.stringify({ message: "Method Not Allowed" }),
        };
    }

    return response;
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};

const getCheckoutSession = async (doctor_email, user_email, time) => {
  try {
    const doctor = await getDoctorByEmail(doctor_email);
    const user = await getUserByEmail(user_email);

    console.log(`Doctor: ${JSON.stringify(doctor)}`);
    console.log(`User: ${JSON.stringify(user)}`);

    if (!doctor || !user) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Error fetching doctor or user" }),
      };
    }

    const currentTime = getCurrentTime();
    const params = {
      TableName: table,
      Item: {
        booking_id: currentTime,
        doctor_email: doctor.email,
        user_email: user.email,
        time: time,
      },
    };

    await dynamoDB.send(new PutCommand(params));

    // Specify the custom email address as the target ARN
    const sns_params = {
      Message: `Dear ${user_email}, your booking for ${time} has been confirmed.`,
      Subject: "Booking Confirmation",
      TopicArn: "arn:aws:sns:us-east-1:654654455850:BookingConfirmation", // Replace with your SNS topic ARN
      MessageAttributes: {
        email: {
          // Define custom attribute to hold the email address
          DataType: "String",
          StringValue: user_email, // Pass the custom email address
        },
      },
    };

    // Publish the message to the SNS topic
    const sns_res = await sns.send(new PublishCommand(sns_params));

    return {
      statusCode: 200,
      body: {
        success: true,
        message: "Success",
        data: params.Item,
        sns_response: JSON.stringify(sns_res),
      },
    };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error creating checkout session" }),
    };
  }
};

const getAllAppointments = async () => {
  try {
    const params = {
      TableName: table,
      // Replace with your actual DynamoDB table name
    };

    const { Items } = await dynamoDB.send(new ScanCommand(params));

    return {
      statusCode: 200,
      body: { message: "Success: GET all appointments", appointments: Items },
    };
  } catch (error) {
    console.error("Error retrieving appointments:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};

const getUserByEmail = async (email) => {
  try {
    const params = {
      TableName: "user_table",
      Key: {
        user_id: email,
      },
    };

    const { Item } = await dynamoDB.send(new GetCommand(params));

    return Item;
  } catch (error) {
    console.error("Error getting user by email:", error);
    throw error;
  }
};

const getDoctorByEmail = async (email) => {
  try {
    const params = {
      TableName: "doctor_table",
      Key: {
        doctor_id: email,
      },
    };

    const { Item } = await dynamoDB.send(new GetCommand(params));

    return Item;
  } catch (error) {
    console.error("Error getting user by email:", error);
    throw error;
  }
};
