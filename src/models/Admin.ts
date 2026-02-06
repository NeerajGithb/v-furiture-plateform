// src/models/Admin.ts - Fixed version
import mongoose, { Document, Schema } from 'mongoose';

export interface IAdmin extends Document {
    _id: mongoose.Types.ObjectId;
    email: string;
    password: string;
    role: 'admin' | 'superadmin';
    createdAt: Date;
    updatedAt: Date;
    createdBy?: mongoose.Types.ObjectId;
    lastLogin?: Date;
    isActive: boolean;
}

const AdminSchema = new Schema<IAdmin>(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please enter a valid email'
            ]
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
        },
        role: {
            type: String,
            required: [true, 'Role is required'],
            enum: {
                values: ['admin', 'superadmin'],
                message: 'Role must be either admin or superadmin'
            },
            default: 'admin'
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'Admin',
            default: null
        },
        lastLogin: {
            type: Date,
            default: null
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (_doc, ret: Record<string, unknown>) {
                delete ret.password;
                return ret;
            }
        }
    }
);

// Indexes for better query performance
AdminSchema.index({ role: 1 });
AdminSchema.index({ isActive: 1 });
AdminSchema.index({ createdAt: -1 });

// Pre-save middleware for data normalization only
AdminSchema.pre('save', function (next) {
    if (this.email) {
        this.email = this.email.toLowerCase().trim();
    }
    next();
});

const Admin = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);

export default Admin;
