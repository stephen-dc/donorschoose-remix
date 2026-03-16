import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import type { Project } from '../types'

const SWIPE_THRESHOLD = 120

interface Props {
  project: Project
  onSwipe: (direction: 'left' | 'right') => void
  isTop: boolean
}

export default function SwipeCard({ project, onSwipe, isTop }: Props) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-300, 300], [-30, 30])
  const likeOpacity = useTransform(x, [20, 120], [0, 1])
  const nopeOpacity = useTransform(x, [-20, -120], [0, 1])

  function triggerSwipe(direction: 'left' | 'right') {
    const target = direction === 'right' ? 600 : -600
    animate(x, target, {
      type: 'tween',
      duration: 0.18,
      ease: 'easeOut',
      onComplete: () => onSwipe(direction),
    })
  }

  function handleDragEnd() {
    const currentX = x.get()
    if (currentX > SWIPE_THRESHOLD) {
      triggerSwipe('right')
    } else if (currentX < -SWIPE_THRESHOLD) {
      triggerSwipe('left')
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 })
    }
  }

  const hasImage = !!project.imageURL
  const fundingCapped = Math.min(project.percentFunded, 100)

  return (
    <motion.div
      className="swipe-card"
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        zIndex: isTop ? 2 : 1,
      }}
      initial={false}
      animate={isTop
        ? { scale: 1, y: 0, opacity: 1 }
        : { scale: 0.93, y: 14, opacity: 0.7 }
      }
      transition={isTop
        ? { type: 'spring', stiffness: 500, damping: 36 }
        : { duration: 0 }
      }
      drag={isTop ? 'x' : false}
      dragElastic={0.7}
      onDragEnd={isTop ? handleDragEnd : undefined}
      whileTap={isTop ? { cursor: 'grabbing' } : undefined}
      data-project-id={project.id}
    >
      {hasImage ? (
        <div
          className="card-image"
          style={{ backgroundImage: `url(${project.retinaImageURL || project.imageURL})` }}
        />
      ) : (
        <div className="card-image-fallback">🏫</div>
      )}

      <div className="card-gradient" />

      {isTop && (
        <>
          <motion.div className="swipe-overlay like" style={{ opacity: likeOpacity }}>LIKE</motion.div>
          <motion.div className="swipe-overlay nope" style={{ opacity: nopeOpacity }}>NOPE</motion.div>
        </>
      )}

      <div className="card-content">
        {project.subject && (
          <div className="card-subject-badge">{project.subject}</div>
        )}
        <div className="card-title">{project.title}</div>
        <div className="card-teacher">
          {project.teacherName}
          {project.schoolName && ` · ${project.schoolName}`}
        </div>
        <div className="card-location">
          📍 {project.city}{project.city && project.state ? ', ' : ''}{project.state}
          {project.gradeLevel?.label && ` · ${project.gradeLevel.label}`}
        </div>
        <div className="card-funding">
          <div className="funding-bar-track">
            <div className="funding-bar-fill" style={{ width: `${fundingCapped}%` }} />
          </div>
          <div className="funding-text">
            <span>{Math.round(fundingCapped)}% funded</span>
            <span>
              ${project.costToComplete.toLocaleString()} needed
              {project.numStudents > 0 && ` · ${project.numStudents} students`}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
