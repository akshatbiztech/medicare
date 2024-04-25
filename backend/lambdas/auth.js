import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import pkg from "@aws-sdk/lib-dynamodb";

const {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  UpdateCommand,
  PutCommand,
} = pkg;
import crypto from "crypto";
import {
  SNSClient,
  PublishCommand,
  SubscribeCommand,
} from "@aws-sdk/client-sns";

const sns = new SNSClient({});

const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const table = "user_table";

export const handler = async (event) => {
  try {
    const action = event.data.action;
    let response;

    switch (action) {
      case "register":
        response = await registerUser(event.data.user);
        break;
      case "login":
        const { email, password, role } = event.data.user;
        response = await login(email, password, role);
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

const registerUser = async (user) => {
  try {
    const { name, email, password, role, photo, gender } = user;

    let existingUser =
      (await role) === "patient"
        ? await getUserByEmail(email)
        : await getDoctorByEmail(email);

    if (existingUser) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "User already exists" }),
      };
    }

    const hashPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    let params = {
      TableName: "user_table",
      Item: {
        user_id: email,
        name,
        email,
        password: hashPassword,
        role,
        photo,
        gender,
      },
    };

    if (role === "doctor") {
      params = {
        TableName: "doctor_table",
        Item: {
          doctor_id: email,
          name,
          email,
          password: hashPassword,
          role,
          photo,
          gender,
        },
      };
    }

    await dynamoDB.send(new PutCommand(params));

    await sns.send(
      new SubscribeCommand({
        Protocol: "email",
        TopicArn: process.env.EmailSnsTopicArn,
        Endpoint: email,
      })
    );

    return {
      statusCode: 200,
      body: { success: true, message: "Account successfully created" },
    };
  } catch (error) {
    console.error("Error registering user:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};

const login = async (email, password, role) => {
  try {
    const user =
      (await role) === "patient"
        ? await getUserByEmail(email)
        : await getDoctorByEmail(email);

    if (!user) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: "Invalid Credentials",
        }),
      };
    }

    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    if (user.password !== hashedPassword) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: "Invalid Credentials",
        }),
      };
    }

    const { password: _, ...userData } = user;

    return {
      statusCode: 200,
      body: { success: true, message: "Successfully login", data: userData },
    };
  } catch (error) {
    console.error("Error logging in:", error);
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
    console.error("Error getting doctor by email:", error);
    throw error;
  }
};
