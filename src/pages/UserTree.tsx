import { useParams} from 'react-router-dom'
import TreeViewer from '../components/client/TreeViewer'

export default function UserTreePage() {
  const { username, slug } = useParams<{ username: string; slug: string }>()
  
  if (!username) {
    return <div>Tree not found</div>
  }
  
  // TreeViewer expects a path prop like "@username/slug"
  const path = slug ? `@${username}/${slug}` : `@${username}`
  
  return <TreeViewer path={path} />
}
