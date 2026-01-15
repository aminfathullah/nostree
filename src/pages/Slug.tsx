import { useParams } from 'react-router-dom'
import SlugTreeViewer from '../components/client/SlugTreeViewer'

export default function SlugPage() {
  const { slug } = useParams<{ slug: string }>()
  
  if (!slug) {
    return <div>Page not found</div>
  }
  
  // Reserved paths that shouldn't be handled by slug viewer
  const reservedPaths = ['login', 'admin', 'profile', 'u']
  if (reservedPaths.includes(slug)) {
    return <div>Page not found</div>
  }
  
  return <SlugTreeViewer slug={slug} />
}
