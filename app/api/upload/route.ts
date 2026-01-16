// app/api/upload/route.ts
import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

// Increase timeout for this route (max 60 seconds for Hobby plan, 300 for Pro)
export const maxDuration = 60;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 60000, // 60 seconds timeout
  secure: true,
});

// Helper function to add timeout to promises
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
}

export async function POST(request: NextRequest) {
  try {
    console.log("Cloudinary config:", {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      has_api_key: !!process.env.CLOUDINARY_API_KEY,
      has_api_secret: !!process.env.CLOUDINARY_API_SECRET,
    });

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (5MB max)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    console.log("File received:", file.name, file.type, file.size);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create upload promise with timeout
    const uploadPromise = new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "blog-images",
          resource_type: "auto",
          chunk_size: 6000000, // 6MB chunks for better reliability
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            console.log("Cloudinary upload result:", result?.secure_url);
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });

    // Add 60 second timeout
    const result = await withTimeout(
      uploadPromise,
      60000,
      "Upload timeout: The upload took too long. Please try again with a smaller image or check your internet connection."
    );

    if (!result?.secure_url) {
      throw new Error("Upload succeeded but no URL was returned");
    }

    return NextResponse.json({ secure_url: result.secure_url });
  } catch (error: any) {
    console.error("Upload error:", error);
    
    // Provide user-friendly error messages
    let errorMessage = "Failed to upload image";
    let statusCode = 500;

    if (error.message?.includes("timeout") || error.message?.includes("Timeout")) {
      errorMessage =
        "Upload timeout. The image may be too large or your connection is slow. Please try again with a smaller image.";
      statusCode = 408; // Request Timeout
    } else if (error.http_code === 499) {
      errorMessage =
        "Upload timeout. Please try again with a smaller image or check your internet connection.";
      statusCode = 408;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
