import { useRef, useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import {
  createComment,
  deleteComment,
  updateComment,
  type CommentResponse,
  type CommentType,
} from '@/apis/board/boardApi'
import { getAuthErrorMessage } from '@/features/auth/getAuthErrorMessage'
import { useAuth } from '@/features/auth/useAuth'
import { routePaths } from '@/router/paths'

const COMMENT_TYPES: { value: CommentType; label: string }[] = [
  { value: 'GENERAL', label: '댓글' },
  { value: 'REVIEW', label: '후기' },
  { value: 'VARIATION', label: '변형 조합' },
]

interface CommentsSectionProps {
  postId: string
  comments: CommentResponse[]
  count: number
  currentUserId: number | null
  onRefresh: () => Promise<void>
}

export function CommentsSection({
  postId,
  comments,
  count,
  currentUserId,
  onRefresh,
}: CommentsSectionProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [type, setType] = useState<CommentType>('GENERAL')
  const [contents, setContents] = useState('')
  const [replyTarget, setReplyTarget] = useState<{ id: number; nickname: string } | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editContents, setEditContents] = useState('')
  const [isBusy, setIsBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const goToLogin = () => {
    navigate(routePaths.login, {
      state: { from: `${location.pathname}${location.search}${location.hash}` },
    })
  }

  const runMutation = async (action: () => Promise<unknown>, onSaved: () => void) => {
    if (isBusy) return

    setIsBusy(true)
    setErrorMessage('')
    try {
      await action()
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error, '요청을 처리하지 못했습니다.'))
      setIsBusy(false)
      return
    }

    onSaved()
    try {
      await onRefresh()
    } catch {
      setErrorMessage('변경사항은 저장됐지만 목록을 새로고치지 못했습니다. 페이지를 다시 열어주세요.')
    } finally {
      setIsBusy(false)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = contents.trim()
    if (!trimmed || trimmed.length > 1000 || isBusy) return
    if (!isAuthenticated) {
      goToLogin()
      return
    }

    void runMutation(
      () => createComment(postId, {
        contents: trimmed,
        parentId: replyTarget?.id ?? null,
        type: replyTarget ? 'GENERAL' : type,
      }),
      () => {
        setContents('')
        setReplyTarget(null)
      },
    )
  }

  const handleEdit = (commentId: number) => {
    const trimmed = editContents.trim()
    if (!trimmed || trimmed.length > 1000 || isBusy) return

    void runMutation(
      () => updateComment(postId, commentId, trimmed),
      () => {
        setEditingId(null)
        setEditContents('')
      },
    )
  }

  const handleDelete = (comment: CommentResponse) => {
    const hasReplies = comment.replies.length > 0
    const message = hasReplies
      ? '댓글을 삭제하면 답글도 함께 삭제됩니다. 삭제하시겠습니까?'
      : '이 댓글을 삭제하시겠습니까?'
    if (isBusy || !window.confirm(message)) return

    void runMutation(
      () => deleteComment(postId, comment.id),
      () => {
        if (replyTarget?.id === comment.id) setReplyTarget(null)
        if (editingId === comment.id) setEditingId(null)
      },
    )
  }

  const startReply = (comment: CommentResponse) => {
    if (!isAuthenticated) {
      goToLogin()
      return
    }
    setReplyTarget({ id: comment.id, nickname: comment.nickname })
    setErrorMessage('')
    inputRef.current?.focus()
  }

  const startEdit = (comment: CommentResponse) => {
    setEditingId(comment.id)
    setEditContents(comment.contents)
    setErrorMessage('')
  }

  const renderComment = (comment: CommentResponse, isReply: boolean) => (
    <article
      key={comment.id}
      className={`${isReply ? 'border-gray2 ml-5 border-l-2 pl-3' : 'border-gray1 border-b'} py-3`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="caption1-semibold break-all">{comment.nickname}</span>
          {!isReply && comment.type !== 'GENERAL' && (
            <span className="caption2-medium bg-sub text-main ml-2 rounded px-2 py-0.5">
              {COMMENT_TYPES.find((item) => item.value === comment.type)?.label}
            </span>
          )}
        </div>
        <time className="caption2-regular text-gray3 shrink-0" dateTime={comment.createdAt}>
          {formatCommentDate(comment.createdAt)}
        </time>
      </div>

      {editingId === comment.id ? (
        <div className="mt-2">
          <textarea
            value={editContents}
            onChange={(event) => setEditContents(event.target.value)}
            maxLength={1000}
            rows={3}
            aria-label="댓글 수정 내용"
            className="caption1-regular border-gray2 focus:border-main w-full resize-none rounded-lg border p-3 outline-none"
          />
          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditingId(null)}
              disabled={isBusy}
              className="caption2-medium text-gray3 disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={() => handleEdit(comment.id)}
              disabled={isBusy || !editContents.trim()}
              className="caption2-semibold text-main disabled:opacity-50"
            >
              저장
            </button>
          </div>
        </div>
      ) : (
        <p className="caption1-regular text-gray4 mt-2 whitespace-pre-wrap break-words">{comment.contents}</p>
      )}

      {editingId !== comment.id && (
        <div className="mt-2 flex gap-3">
          {!isReply && (
            <button
              type="button"
              onClick={() => startReply(comment)}
              disabled={isBusy}
              className="caption2-medium text-gray3 disabled:opacity-50"
            >
              답글
            </button>
          )}
          {currentUserId === comment.writerId && (
            <>
              <button
                type="button"
                onClick={() => startEdit(comment)}
                disabled={isBusy}
                className="caption2-medium text-gray3 disabled:opacity-50"
              >
                수정
              </button>
              <button
                type="button"
                onClick={() => handleDelete(comment)}
                disabled={isBusy}
                className="caption2-medium text-main disabled:opacity-50"
              >
                삭제
              </button>
            </>
          )}
        </div>
      )}
    </article>
  )

  return (
    <section className="border-gray1 mt-6 border-t pt-5" aria-labelledby="comments-title">
      <h2 id="comments-title" className="body2-semibold">댓글 {count}</h2>

      {comments.length === 0 ? (
        <p className="caption1-medium text-gray3 py-6 text-center">첫 댓글을 작성해보세요.</p>
      ) : (
        <div className="mt-3">
          {comments.map((comment) => (
            <div key={comment.id}>
              {renderComment(comment, false)}
              {comment.replies.map((reply) => renderComment(reply, true))}
            </div>
          ))}
        </div>
      )}

      {errorMessage && (
        <p className="caption2-medium bg-sub text-main mt-3 rounded-lg px-3 py-2" role="alert">
          {errorMessage}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-5">
        {replyTarget ? (
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="caption2-medium text-gray4 truncate">{replyTarget.nickname}님에게 답글</span>
            <button
              type="button"
              onClick={() => setReplyTarget(null)}
              className="caption2-medium text-gray3 shrink-0"
            >
              취소
            </button>
          </div>
        ) : (
          <div className="mb-3 flex gap-2" role="group" aria-label="작성 종류">
            {COMMENT_TYPES.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setType(item.value)}
                aria-pressed={type === item.value}
                className={`caption2-medium h-8 flex-1 rounded-lg border ${type === item.value ? 'border-main bg-sub text-main' : 'border-gray2 text-gray4'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {isAuthenticated ? (
          <>
            <textarea
              ref={inputRef}
              value={contents}
              onChange={(event) => setContents(event.target.value)}
              maxLength={1000}
              rows={3}
              placeholder={replyTarget ? '답글을 입력해주세요.' : '내용을 입력해주세요.'}
              aria-label={replyTarget ? '답글 내용' : '댓글 내용'}
              className="caption1-regular border-gray2 focus:border-main w-full resize-none rounded-lg border bg-white p-3 outline-none"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="caption2-regular text-gray3">{contents.length}/1000</span>
              <button
                type="submit"
                disabled={isBusy || !contents.trim()}
                className="caption1-semibold bg-main h-9 min-w-18 rounded-lg px-4 text-white disabled:opacity-50"
              >
                {isBusy ? '처리 중...' : '등록'}
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={goToLogin}
            className="caption1-medium border-gray2 text-gray3 h-11 w-full rounded-lg border bg-white"
          >
            로그인하고 작성하기
          </button>
        )}
      </form>
    </section>
  )
}

function formatCommentDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}
