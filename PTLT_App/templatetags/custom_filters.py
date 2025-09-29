from django import template

register = template.Library()

@register.filter
def index(indexable, i):
    """Get item at index i from a list/queryset"""
    try:
        return indexable[int(i)]
    except (IndexError, ValueError, TypeError):
        return None