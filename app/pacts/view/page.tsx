import { Suspense } from 'react';
import ViewPactClient from '@/components/ViewPactClient';
export default function Page(){return <Suspense fallback={<div/>}><ViewPactClient/></Suspense>}
