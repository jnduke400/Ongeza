import React, { useState, useEffect, useRef } from 'react';
import {
    Shield, Eye, EyeOff, Edit2, UserPlus, X, Monitor, Smartphone, Tablet,
    Palette, MapPin, Calendar, User, UserCircle2, CheckCircle, Crown, Flag, Languages, Phone, Mail, MessageSquare,
    BarChart2, FileText as FileIcon, Check, Loader2, File as FileIconLucide
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { User as UserType } from '../types';
import { API_BASE_URL } from '../services/apiConfig';
import { interceptedFetch } from '../services/api';
import { useLocation, Link } from 'react-router-dom';

interface ProfileApiResponse {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    tfaPhoneNumber: string;
    status: string;
    userCategory: string;
    activity: string;
    roleName: string;
    roleId: number;
    createdAt: string;
    updatedAt: string;
    lastLogin: string | null;
    pinSet: boolean;
    preferredLanguage: string;
    address: {
        country: string;
        region: string;
        district: string;
        street: string;
        postalCode: string;
    };
}

interface TimelineActivity {
    id: number;
    activityType: string;
    module: string;
    title: string;
    description: string;
    referenceType: 'GOAL' | 'TRANSACTION' | 'APPROVAL_REQUEST