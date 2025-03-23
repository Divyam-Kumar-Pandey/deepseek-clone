import { Webhook } from "svix";
import connectDB from "@/config/db";
import User from "@/models/User";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
    if(!process.env.SIGNING_SECRET) {
        return NextResponse.json({error: "SIGNING_SECRET is not defined"}, {status: 500});
    }
    const wh = new Webhook(process.env.SIGNING_SECRET as string);
    const headerPayload = await headers()
    const svixHeaders = {
        "svix-id": headerPayload.get("svix-id") as string,
        "svix-timestamp": headerPayload.get("svix-timestamp") as string,
        "svix-signature": headerPayload.get("svix-signature") as string,
    };

    // Get the payload and verify it
    try {
    const payload = await req.json();
    const body = JSON.stringify(payload);
    const {data, type} = wh.verify(body, svixHeaders as Record<string, string>) as {data: any, type: string};

    console.log("data:", data);

    const userData = {
        _id: data.id,
        email: data.email_addresses?.[0]?.email_address || "",
        name: `${data.first_name} ${data.last_name}`,
        image: data.image_url,
    };

    await connectDB();

    switch (type) {
        case 'user.created':
            await User.create(userData)
            break;
    
        case 'user.updated':
            await User.findByIdAndUpdate(data.id, userData)
            break;

        case 'user.deleted':
            await User.findByIdAndUpdate(data.id, {isDeleted: true})
            break;
    
        default:
            break;
    }

    return NextResponse.json({message: "Event received"}, {status: 200});
    } catch (error) {
        console.error("Error verifying payload:", error);
        return NextResponse.json({error: "Error verifying payload"}, {status: 500});
    }
}