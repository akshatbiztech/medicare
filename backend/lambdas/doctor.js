// import AWS from "aws-sdk";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import pkg from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";
const {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  UpdateCommand,
  PutCommand,
} = pkg;

const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const table = "doctor_table";

// const dynamoDB = new AWS.DynamoDB.DocumentClient();

export const handler = async (event) => {
  try {
    const operation = event.data.action;
    let response;

    switch (operation) {
      case "registerDoctor":
        response = await registerDoctor(event.data.doctor);
        break;
      case "getAllDoctors":
        response = await getAllDoctor();
        break;
      case "getSingleDoctor":
        response = await getSingleDoctor(event.data.id);
        break;
      case "updateDoctor":
        response = await updateDoctor(event.data.email, event.data.doctor);
        break;
      case "DELETE":
        response = await deleteDoctor(event.pathParameters.id);
        break;
      default:
        response = {
          statusCode: 405,
          body: JSON.stringify({ message: "Method Not Allowed" }),
        };
    }

    return response;
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};

// Create new doctor
const registerDoctor = async (doctor) => {
  try {
    let existingDoctor = await getDoctorByEmail(doctor.email);

    if (existingDoctor) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Doctor already exists" }),
      };
    }

    const hashPassword = crypto
      .createHash("sha256")
      .update(doctor.email)
      .digest("hex");

    const params = {
      TableName: table,
      Item: {
        doctor_id: doctor.email, // Assuming email as the unique identifier for users
        password: hashPassword,
        ...doctor,
      },
    };

    await dynamoDB.send(new PutCommand(params));

    return {
      statusCode: 200,
      body: { success: true, message: "User successfully created" },
    };
  } catch (error) {
    console.error("Error registering user:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};

const getSingleDoctor = async (id) => {
  try {
    const params = {
      TableName: table, // Replace with your actual DynamoDB table name
      Key: {
        doctor_id: id, // Assuming id is the primary key of your DynamoDB table and it's a string
      },
    };

    const { Item } = await dynamoDB.send(new GetCommand(params));

    if (!Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Doctor not found" }),
      };
    }

    return {
      statusCode: 200,
      body: { message: "Success: GET single doctor", doctor: Item },
    };
  } catch (error) {
    console.error("Error retrieving doctor:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};

const getAllDoctor = async () => {
  try {
    const params = {
      TableName: table, // Replace with your actual DynamoDB table name
    };

    const { Items } = await dynamoDB.send(new ScanCommand(params));

    return {
      statusCode: 200,
      body: { message: "Success: GET all doctors", doctors: Items },
    };
  } catch (error) {
    console.error("Error retrieving doctors:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};

const getDoctorByEmail = async (email) => {
  try {
    const params = {
      TableName: table,
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

const updateDoctor = async (email, doctor) => {
  try {
    if (
      !doctor ||
      typeof doctor !== "object" ||
      Object.keys(doctor).length === 0
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Invalid or empty doctor object provided",
        }),
      };
    }

    const params = {
      TableName: table,
      Key: { doctor_id: email },
      UpdateExpression:
        "SET " +
        Object.keys(doctor)
          .map((key) => {
            if (Array.isArray(doctor[key])) {
              // For list attributes, handle them differently
              return `#${key} = list_append(if_not_exists(#${key}, :empty_list), :${key})`;
            } else {
              return `#${key} = :${key}`;
            }
          })
          .join(", "),
      ExpressionAttributeNames: Object.keys(doctor).reduce(
        (acc, key) => ({ ...acc, [`#${key}`]: key }),
        {}
      ),
      ExpressionAttributeValues: Object.keys(doctor).reduce((acc, key) => {
        if (Array.isArray(doctor[key])) {
          // For list attributes, include an empty list to handle if the attribute doesn't exist yet
          return { ...acc, [`:${key}`]: doctor[key], ":empty_list": [] };
        } else {
          return { ...acc, [`:${key}`]: doctor[key] };
        }
      }, {}),
      ReturnValues: "ALL_NEW",
    };

    const { Attributes } = await dynamoDB.send(new UpdateCommand(params));

    return {
      statusCode: 200,
      body: { message: "Success: Update single doctor", doctor: Attributes },
    };
  } catch (error) {
    console.error("Error updating doctor:", error);
    return {
      statusCode: 500,
      body: { message: "Internal Server Error" },
    };
  }
};

const deleteDoctor = async (id) => {
  // Delete doctor from DynamoDB based on ID
  return "Success: Delete single doctor";
};
