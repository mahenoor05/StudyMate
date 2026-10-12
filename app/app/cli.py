"""Admin commands for StudyMate.

Run them from the project folder, for example:
  flask --app run.py list-users
  flask --app run.py delete-users --email old@example.com            (dry run)
  flask --app run.py delete-users --email old@example.com --apply    (really deletes)
  flask --app run.py delete-users --all-except me@example.com        (dry run)
  flask --app run.py reset-password --email someone@example.com
"""
import click
from sqlalchemy import func

from .extensions import db
from .models import (
    ActiveFocusSession,
    GroupMembership,
    GroupMessage,
    StudyGroup,
    StudySession,
    User,
    UserAppState,
)


def delete_user_completely(user):
    """Remove a user and everything that belongs to them. Does not commit."""
    from .api.routes import clear_personal_data, delete_user_upload

    delete_user_upload(user.avatar_url)
    delete_user_upload(user.banner_url)

    # Groups they own: hand the group to the longest-standing other member, or delete it if nobody else is in it.
    for group in StudyGroup.query.filter_by(owner_id=user.id).all():
        others = (
            GroupMembership.query.filter(
                GroupMembership.group_id == group.id,
                GroupMembership.user_id != user.id,
            )
            .order_by(GroupMembership.joined_at.asc())
            .all()
        )
        if others:
            group.owner_id = others[0].user_id
            others[0].role = "owner"
        else:
            db.session.delete(group)
    db.session.flush()

    GroupMessage.query.filter_by(user_id=user.id).delete(synchronize_session=False)
    GroupMembership.query.filter_by(user_id=user.id).delete(synchronize_session=False)
    ActiveFocusSession.query.filter_by(user_id=user.id).delete(synchronize_session=False)
    clear_personal_data(user.id)
    UserAppState.query.filter_by(user_id=user.id).delete(synchronize_session=False)
    db.session.flush()
    db.session.delete(user)


def describe(user, session_counts):
    created = user.created_at.strftime("%Y-%m-%d") if user.created_at else "?"
    last = user.last_login_at.strftime("%Y-%m-%d") if user.last_login_at else "never"
    return (
        f"#{user.id:<4} {user.username:<20} {user.email:<34} "
        f"created {created}  last login {last}  sessions {session_counts.get(user.id, 0)}"
    )


def register_cli(app):
    @app.cli.command("list-users")
    def list_users_command():
        """Show every account (id, username, email, activity)."""
        counts = dict(
            db.session.query(StudySession.user_id, func.count(StudySession.id))
            .group_by(StudySession.user_id)
            .all()
        )
        users = User.query.order_by(User.id.asc()).all()
        for user in users:
            click.echo(describe(user, counts))
        click.echo(f"\n{len(users)} account(s).")

    @app.cli.command("delete-users")
    @click.option("--email", "emails", multiple=True, help="Delete the account with this email. Repeat for several.")
    @click.option("--all-except", "keep_emails", multiple=True, help="Delete EVERY account except these emails. Repeat for several.")
    @click.option("--apply", "should_apply", is_flag=True, help="Actually delete. Without this it is only a dry run.")
    def delete_users_command(emails, keep_emails, should_apply):
        """Permanently delete test accounts and all their data."""
        if bool(emails) == bool(keep_emails):
            raise click.UsageError("Use either --email (delete these) or --all-except (keep these), not both and not neither.")

        counts = dict(
            db.session.query(StudySession.user_id, func.count(StudySession.id))
            .group_by(StudySession.user_id)
            .all()
        )

        if emails:
            wanted = {email.strip().lower() for email in emails}
            targets = User.query.filter(func.lower(User.email).in_(wanted)).all()
            missing = wanted - {user.email.lower() for user in targets}
            for email in sorted(missing):
                click.echo(f"Warning: no account found for {email}")
            kept = []
        else:
            keep = {email.strip().lower() for email in keep_emails}
            everyone = User.query.order_by(User.id.asc()).all()
            kept = [user for user in everyone if user.email.lower() in keep]
            if not kept:
                raise click.ClickException(
                    "None of the --all-except emails match an account, so this would delete everyone. Check the spelling. Nothing was changed."
                )
            targets = [user for user in everyone if user.email.lower() not in keep]

        if kept:
            click.echo("Accounts that will be KEPT:")
            for user in kept:
                click.echo("  " + describe(user, counts))
            click.echo("")

        if not targets:
            click.echo("Nothing to delete.")
            return

        click.echo("Accounts that will be DELETED:")
        for user in targets:
            click.echo("  " + describe(user, counts))

        if not should_apply:
            click.echo(f"\nDry run: {len(targets)} account(s) would be deleted. Add --apply to do it.")
            return

        if not click.confirm(f"\nPermanently delete {len(targets)} account(s) and all of their data?", default=False):
            click.echo("Cancelled. Nothing was changed.")
            return

        for user in targets:
            delete_user_completely(user)
        db.session.commit()
        click.echo(f"Deleted {len(targets)} account(s).")

    @app.cli.command("reset-password")
    @click.option("--email", required=True, help="Email of the account.")
    @click.password_option("--password", prompt="New password", confirmation_prompt=True, help="New password (asked securely if you leave it out).")
    def reset_password_command(email, password):
        """Set a new password for an account (useful before email reset is set up)."""
        user = User.query.filter(func.lower(User.email) == email.strip().lower()).first()
        if not user:
            raise click.ClickException("No account found for that email.")
        if len(password) < 8:
            raise click.ClickException("Password must be at least 8 characters.")
        user.set_password(password)
        db.session.commit()
        click.echo(f"Password updated for {user.username}.")
